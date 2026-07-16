import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FlashcardReview, type CartaoDevido } from "@/components/flashcards/FlashcardReview";

export const metadata: Metadata = { title: "Revisar flashcards — Asterik" };

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

type PageProps = {
  searchParams: Promise<{
    sistema_id?: string;
    prancha_id?: string;
    modo?: string;
  }>;
};

export default async function FlashcardsRevisarPage({ searchParams }: PageProps) {
  const { sistema_id: sistemaId, prancha_id: pranchaId, modo } = await searchParams;

  if (!sistemaId && !pranchaId && modo !== "devidos" && modo !== "todos") notFound();

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
    .from("flashcards")
    .select(
      "id, frente, verso, imagem_url, marcador_x, marcador_y, marcador_numero, alternativas, resposta_correta, explicacao, tipo, prancha_id, pranchas(titulo, numero_prancha)"
    );

  if (pranchaId) {
    query = query.eq("prancha_id", pranchaId);
  } else if (pranchaIds) {
    query = query.in("prancha_id", pranchaIds);
  }

  const { data: flashcards } = await query;
  if (!flashcards?.length) notFound();

  const { data: progresso } = await supabase
    .from("flashcard_progresso")
    .select("flashcard_id, caixa, proxima_revisao")
    .eq("user_id", user!.id);

  const progressoPorCartao = new Map((progresso ?? []).map((p) => [p.flashcard_id, p]));
  const hoje = new Date().toISOString().slice(0, 10);

  let cartoes: CartaoDevido[] = flashcards.map((f) => {
    const p = progressoPorCartao.get(f.id);
    return {
      id: f.id,
      frente: f.frente,
      verso: f.verso,
      imagemUrl: f.imagem_url,
      marcadorX: f.marcador_x,
      marcadorY: f.marcador_y,
      marcadorNumero: f.marcador_numero,
      tipo: f.tipo,
      explicacao: f.explicacao,
      pranchaTitulo: f.pranchas ? `${f.pranchas.numero_prancha} · ${f.pranchas.titulo}` : "",
      caixaAtual: p?.caixa ?? 1,
      alternativas: (f.alternativas as string[] | null) ?? null,
      modoAtivo: Boolean(f.resposta_correta),
    };
  });

  if (modo === "devidos") {
    cartoes = cartoes.filter((c) => {
      const proximaRevisao = progressoPorCartao.get(c.id)?.proxima_revisao;
      return !proximaRevisao || proximaRevisao <= hoje;
    });
  }

  if (!cartoes.length) notFound();

  cartoes = embaralhar(cartoes);

  const paramsRepetir = new URLSearchParams();
  if (pranchaId) paramsRepetir.set("prancha_id", pranchaId);
  else if (sistemaId) paramsRepetir.set("sistema_id", sistemaId);
  if (modo) paramsRepetir.set("modo", modo);
  const linkRepetir = `/flashcards/revisar?${paramsRepetir.toString()}`;

  return (
    <div className="mx-auto max-w-3xl">
      <FlashcardReview cartoes={cartoes} linkRepetir={linkRepetir} />
    </div>
  );
}
