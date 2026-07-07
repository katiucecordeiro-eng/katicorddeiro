"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Classificacao = "errei" | "dificil" | "facil";

const INTERVALOS_DIAS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
const XP_POR_CLASSIFICACAO: Record<Classificacao, number> = {
  errei: 0,
  dificil: 2,
  facil: 5,
};

export type RevisarFlashcardResult = { error: string | null; xpGanho?: number };

export async function revisarFlashcard(
  flashcard_id: string,
  caixaAtual: number,
  classificacao: Classificacao
): Promise<RevisarFlashcardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  let novaCaixa: number;
  if (classificacao === "errei") {
    novaCaixa = 1;
  } else if (classificacao === "dificil") {
    novaCaixa = caixaAtual;
  } else {
    novaCaixa = Math.min(5, caixaAtual + 1);
  }

  const dias = INTERVALOS_DIAS[novaCaixa] ?? 1;
  const proximaRevisao = new Date();
  proximaRevisao.setDate(proximaRevisao.getDate() + dias);

  const { error } = await supabase.from("flashcard_progresso").upsert(
    {
      user_id: user.id,
      flashcard_id,
      caixa: novaCaixa,
      proxima_revisao: proximaRevisao.toISOString().slice(0, 10),
    },
    { onConflict: "user_id,flashcard_id" }
  );
  if (error) return { error: "Não foi possível salvar sua revisão." };

  const xpGanho = XP_POR_CLASSIFICACAO[classificacao];
  if (xpGanho > 0) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("xp_total")
      .eq("id", user.id)
      .single();
    await supabase
      .from("profiles")
      .update({ xp_total: (perfil?.xp_total ?? 0) + xpGanho })
      .eq("id", user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/flashcards");
  revalidatePath("/ranking");

  return { error: null, xpGanho };
}
