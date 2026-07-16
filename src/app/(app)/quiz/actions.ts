"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const XP_POR_ACERTO = 10;
const PESO_MINIMO = 1;
const PESO_MAXIMO = 10;

export type RespostaEnviada =
  | { tipo: "multipla_escolha"; valor: string }
  | { tipo: "apontar_imagem"; valor: { x: number; y: number } };

export type RegistrarRespostaResult = {
  error: string | null;
  acertou?: boolean;
  respostaCorreta?: string;
  explicacao?: string | null;
  xpGanho?: number;
};

export async function registrarResposta(
  pergunta_id: string,
  resposta: RespostaEnviada
): Promise<RegistrarRespostaResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: pergunta } = await supabase
    .from("quiz_perguntas")
    .select("tipo, alternativas, resposta_correta, explicacao")
    .eq("id", pergunta_id)
    .single();

  if (!pergunta) return { error: "Pergunta não encontrada." };

  let acertou = false;
  if (pergunta.tipo === "multipla_escolha" && resposta.tipo === "multipla_escolha") {
    acertou = resposta.valor === pergunta.resposta_correta;
  } else if (pergunta.tipo === "apontar_imagem" && resposta.tipo === "apontar_imagem") {
    const alvo = pergunta.alternativas as {
      ponto_correto?: { x: number; y: number };
      raio_tolerancia?: number;
    } | null;
    const pontoCorreto = alvo?.ponto_correto;
    const raio = alvo?.raio_tolerancia ?? 0.15;
    if (pontoCorreto) {
      const dx = resposta.valor.x - pontoCorreto.x;
      const dy = resposta.valor.y - pontoCorreto.y;
      acertou = Math.sqrt(dx * dx + dy * dy) <= raio;
    }
  }

  const { data: ultimaResposta } = await supabase
    .from("quiz_respostas_usuario")
    .select("peso_repeticao")
    .eq("user_id", user.id)
    .eq("pergunta_id", pergunta_id)
    .order("respondido_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  const pesoAnterior = ultimaResposta?.peso_repeticao ?? PESO_MINIMO;
  const novoPeso = acertou
    ? Math.max(PESO_MINIMO, pesoAnterior - 1)
    : Math.min(PESO_MAXIMO, pesoAnterior + 2);

  const { error: erroResposta } = await supabase.from("quiz_respostas_usuario").insert({
    user_id: user.id,
    pergunta_id,
    acertou,
    peso_repeticao: novoPeso,
  });
  if (erroResposta) return { error: "Não foi possível registrar a resposta." };

  let xpGanho = 0;
  if (acertou) {
    xpGanho = XP_POR_ACERTO;
    const { data: perfil } = await supabase
      .from("profiles")
      .select("xp_total")
      .eq("id", user.id)
      .single();
    await supabase
      .from("profiles")
      .update({ xp_total: (perfil?.xp_total ?? 0) + XP_POR_ACERTO })
      .eq("id", user.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/ranking");

  return {
    error: null,
    acertou,
    respostaCorreta: pergunta.resposta_correta,
    explicacao: pergunta.explicacao,
    xpGanho,
  };
}
