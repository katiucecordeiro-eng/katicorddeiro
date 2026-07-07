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

function normalizarResposta(texto: string): string {
  return texto.trim().toLowerCase();
}

async function aplicarRevisao(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  flashcardId: string,
  caixaAtual: number,
  classificacao: Classificacao
): Promise<{ error: string | null; xpGanho?: number }> {
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
      user_id: userId,
      flashcard_id: flashcardId,
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
      .eq("id", userId)
      .single();
    await supabase
      .from("profiles")
      .update({ xp_total: (perfil?.xp_total ?? 0) + xpGanho })
      .eq("id", userId);
  }

  revalidatePath("/dashboard");
  revalidatePath("/flashcards");
  revalidatePath("/ranking");

  return { error: null, xpGanho };
}

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

  return aplicarRevisao(supabase, user.id, flashcard_id, caixaAtual, classificacao);
}

export type ResponderFlashcardResult = {
  error: string | null;
  acertou?: boolean;
  respostaCorreta?: string;
  verso?: string;
  xpGanho?: number;
};

export async function responderFlashcardAtivo(
  flashcard_id: string,
  caixaAtual: number,
  resposta: string
): Promise<ResponderFlashcardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: flashcard } = await supabase
    .from("flashcards")
    .select("resposta_correta, verso")
    .eq("id", flashcard_id)
    .single();

  if (!flashcard?.resposta_correta) {
    return { error: "Este flashcard não tem correção automática." };
  }

  const acertou = normalizarResposta(resposta) === normalizarResposta(flashcard.resposta_correta);
  const classificacao: Classificacao = acertou ? "facil" : "errei";

  const resultado = await aplicarRevisao(supabase, user.id, flashcard_id, caixaAtual, classificacao);
  if (resultado.error) return { error: resultado.error };

  return {
    error: null,
    acertou,
    respostaCorreta: flashcard.resposta_correta,
    verso: flashcard.verso,
    xpGanho: resultado.xpGanho,
  };
}
