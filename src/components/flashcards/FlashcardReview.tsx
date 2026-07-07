"use client";

import { useState, useTransition } from "react";
import { revisarFlashcard, type Classificacao } from "@/app/(app)/flashcards/actions";

export type CartaoDevido = {
  id: string;
  frente: string;
  verso: string;
  imagemUrl: string | null;
  pranchaTitulo: string;
  caixaAtual: number;
};

export function FlashcardReview({ cartoes }: { cartoes: CartaoDevido[] }) {
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [revisados, setRevisados] = useState(0);
  const [pendente, iniciarTransicao] = useTransition();

  const cartao = cartoes[indice];
  const concluido = indice >= cartoes.length;

  function classificar(classificacao: Classificacao) {
    if (!cartao || pendente) return;
    iniciarTransicao(async () => {
      const resultado = await revisarFlashcard(cartao.id, cartao.caixaAtual, classificacao);
      setXpAcumulado((xp) => xp + (resultado.xpGanho ?? 0));
      setRevisados((r) => r + 1);
      setVirado(false);
      setIndice((i) => i + 1);
    });
  }

  if (concluido) {
    return (
      <div className="border-ornamental rounded-sm bg-paper-dark/40 p-8 text-center">
        <p className="font-hand text-3xl text-wine">Revisão concluída!</p>
        <p className="mt-2 text-ink-soft">
          Você revisou {revisados} {revisados === 1 ? "cartão" : "cartões"} e ganhou{" "}
          {xpAcumulado} XP.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-hand-note text-sm text-ink-soft">
        Cartão {indice + 1} de {cartoes.length} — {cartao.pranchaTitulo}
      </p>

      <button
        type="button"
        onClick={() => setVirado((v) => !v)}
        className="notebook-page flex min-h-[16rem] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-sm px-8 py-10 text-center transition-transform hover:-translate-y-0.5"
      >
        {!virado ? (
          <>
            <p className="font-hand text-2xl text-ink">{cartao.frente}</p>
            {cartao.imagemUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cartao.imagemUrl} alt="" className="max-h-40 w-auto" />
            )}
            <span className="text-xs tracking-wide text-gold uppercase">Toque para virar</span>
          </>
        ) : (
          <p className="font-serif text-lg text-ink">{cartao.verso}</p>
        )}
      </button>

      {virado && (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={pendente}
            onClick={() => classificar("errei")}
            className="rounded-sm bg-wine px-5 py-2.5 font-medium text-paper hover:bg-wine-dark disabled:opacity-50"
          >
            Errei
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={() => classificar("dificil")}
            className="rounded-sm bg-gold px-5 py-2.5 font-medium text-ink hover:bg-gold-soft disabled:opacity-50"
          >
            Difícil
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={() => classificar("facil")}
            className="rounded-sm bg-slate px-5 py-2.5 font-medium text-paper hover:bg-slate-dark disabled:opacity-50"
          >
            Fácil
          </button>
        </div>
      )}
    </div>
  );
}
