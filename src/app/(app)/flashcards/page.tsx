import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FlashcardReview, type CartaoDevido } from "@/components/flashcards/FlashcardReview";

export const metadata: Metadata = { title: "Flashcards — Asterik" };

export default async function FlashcardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id, frente, verso, imagem_url, prancha_id, pranchas(titulo, numero_prancha)");

  const { data: progresso } = await supabase
    .from("flashcard_progresso")
    .select("flashcard_id, caixa, proxima_revisao")
    .eq("user_id", user!.id);

  const progressoPorCartao = new Map((progresso ?? []).map((p) => [p.flashcard_id, p]));

  const hoje = new Date().toISOString().slice(0, 10);

  const devidos: CartaoDevido[] = (flashcards ?? [])
    .filter((f) => {
      const proximaRevisao = progressoPorCartao.get(f.id)?.proxima_revisao;
      return !proximaRevisao || proximaRevisao <= hoje;
    })
    .map((f) => {
      const p = progressoPorCartao.get(f.id);
      return {
        id: f.id,
        frente: f.frente,
        verso: f.verso,
        imagemUrl: f.imagem_url,
        pranchaTitulo: f.pranchas ? `${f.pranchas.numero_prancha} · ${f.pranchas.titulo}` : "",
        caixaAtual: p?.caixa ?? 1,
      };
    });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">Revisar hoje</h1>
        <p className="mt-1 text-ink-soft">
          Flashcards no sistema de repetição espaçada (Leitner). Classifique sua lembrança
          após virar cada carta.
        </p>
      </div>

      {devidos.length ? (
        <FlashcardReview cartoes={devidos} />
      ) : (
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-6 text-center">
          <p className="text-ink-soft">
            Nenhum flashcard pendente por hoje. Volte amanhã para continuar revisando!
          </p>
        </div>
      )}
    </div>
  );
}
