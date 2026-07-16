import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizSession, type PerguntaSessao } from "@/components/quiz/QuizSession";
import type { Database } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Quiz — Asterik" };

type Dificuldade = Database["public"]["Enums"]["dificuldade_quiz"];
const DIFICULDADES: Dificuldade[] = ["facil", "medio", "dificil"];

type PageProps = {
  searchParams: Promise<{
    sistema_id?: string;
    prancha_id?: string;
    dificuldade?: string;
  }>;
};

type CandidataPergunta = PerguntaSessao & { peso: number };

function selecionarPerguntasSessao(
  perguntas: CandidataPergunta[],
  limite = 10
): PerguntaSessao[] {
  const escolhidas = perguntas
    .map((item) => ({ item, chave: item.peso + Math.random() * 0.99 }))
    .sort((a, b) => b.chave - a.chave)
    .slice(0, limite)
    .map(({ item }) => item);

  for (let i = escolhidas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [escolhidas[i], escolhidas[j]] = [escolhidas[j], escolhidas[i]];
  }

  return escolhidas.map((item): PerguntaSessao => ({
    id: item.id,
    pergunta: item.pergunta,
    tipo: item.tipo,
    alternativas: item.alternativas,
    pranchaTitulo: item.pranchaTitulo,
    pranchaNumero: item.pranchaNumero,
  }));
}

export default async function QuizJogarPage({ searchParams }: PageProps) {
  const {
    sistema_id: sistemaId,
    prancha_id: pranchaId,
    dificuldade: dificuldadeParam,
  } = await searchParams;

  const dificuldade: Dificuldade = DIFICULDADES.includes(dificuldadeParam as Dificuldade)
    ? (dificuldadeParam as Dificuldade)
    : "facil";

  if (!sistemaId && !pranchaId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pranchaIds: string[] | null = null;
  if (sistemaId && !pranchaId) {
    const { data: pranchasDoSistema } = await supabase
      .from("pranchas")
      .select("id")
      .eq("sistema_id", sistemaId);
    pranchaIds = (pranchasDoSistema ?? []).map((p) => p.id);
    if (!pranchaIds.length) notFound();
  }

  let query = supabase
    .from("quiz_perguntas")
    .select("id, pergunta, tipo, alternativas, prancha_id, pranchas(titulo, numero_prancha)")
    .eq("dificuldade", dificuldade);

  if (pranchaId) {
    query = query.eq("prancha_id", pranchaId);
  } else if (pranchaIds) {
    query = query.in("prancha_id", pranchaIds);
  }

  const { data: perguntas } = await query;
  if (!perguntas?.length) notFound();

  const idsPerguntas = perguntas.map((p) => p.id);
  const { data: respostasAnteriores } = user
    ? await supabase
        .from("quiz_respostas_usuario")
        .select("pergunta_id, peso_repeticao, respondido_em")
        .eq("user_id", user.id)
        .in("pergunta_id", idsPerguntas)
        .order("respondido_em", { ascending: false })
    : { data: null };

  const pesoPorPergunta = new Map<string, number>();
  for (const resposta of respostasAnteriores ?? []) {
    if (!pesoPorPergunta.has(resposta.pergunta_id)) {
      pesoPorPergunta.set(resposta.pergunta_id, resposta.peso_repeticao);
    }
  }

  const candidatas: CandidataPergunta[] = perguntas.map((p) => {
    const alternativas =
      p.tipo === "apontar_imagem"
        ? {
            imagem_url:
              (p.alternativas as { imagem_url?: string } | null)?.imagem_url ?? "",
          }
        : ((p.alternativas as string[] | null) ?? []);

    return {
      id: p.id,
      pergunta: p.pergunta,
      tipo: p.tipo,
      alternativas,
      pranchaTitulo: p.pranchas?.titulo ?? "",
      pranchaNumero: p.pranchas?.numero_prancha ?? "",
      peso: pesoPorPergunta.get(p.id) ?? 1,
    };
  });

  const sessao = selecionarPerguntasSessao(candidatas);

  return (
    <div className="mx-auto max-w-2xl">
      <QuizSession perguntas={sessao} />
    </div>
  );
}
