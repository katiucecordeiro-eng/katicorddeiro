"use client";

import { useState, useTransition } from "react";
import {
  revisarFlashcard,
  responderFlashcardAtivo,
  type Classificacao,
} from "@/app/(app)/flashcards/actions";

export type CartaoDevido = {
  id: string;
  frente: string;
  verso: string;
  imagemUrl: string | null;
  marcadorX: number | null;
  marcadorY: number | null;
  pranchaTitulo: string;
  caixaAtual: number;
  alternativas: string[] | null;
  modoAtivo: boolean;
};

type FeedbackAtivo = { acertou: boolean; respostaCorreta: string; verso: string };

function Marcador({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-wine bg-wine/40"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
    />
  );
}

export function FlashcardReview({ cartoes }: { cartoes: CartaoDevido[] }) {
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [feedbackAtivo, setFeedbackAtivo] = useState<FeedbackAtivo | null>(null);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [estruturasErradas, setEstruturasErradas] = useState<string[]>([]);
  const [pendente, iniciarTransicao] = useTransition();

  const cartao = cartoes[indice];
  const concluido = indice >= cartoes.length;
  const revisados = acertos + erros;

  function avancar() {
    setVirado(false);
    setRespostaTexto("");
    setFeedbackAtivo(null);
    setIndice((i) => i + 1);
  }

  function classificar(classificacao: Classificacao) {
    if (!cartao || pendente) return;
    iniciarTransicao(async () => {
      const resultado = await revisarFlashcard(cartao.id, cartao.caixaAtual, classificacao);
      setXpAcumulado((xp) => xp + (resultado.xpGanho ?? 0));
      if (classificacao === "errei") {
        setErros((e) => e + 1);
        setEstruturasErradas((atual) => [...atual, cartao.frente]);
      } else {
        setAcertos((a) => a + 1);
      }
      avancar();
    });
  }

  function responderAtivo(resposta: string) {
    if (!cartao || pendente || feedbackAtivo || !resposta.trim()) return;
    iniciarTransicao(async () => {
      const resultado = await responderFlashcardAtivo(cartao.id, cartao.caixaAtual, resposta);
      if (resultado.error || resultado.acertou === undefined) return;
      setFeedbackAtivo({
        acertou: resultado.acertou,
        respostaCorreta: resultado.respostaCorreta ?? "",
        verso: resultado.verso ?? cartao.verso,
      });
      setXpAcumulado((xp) => xp + (resultado.xpGanho ?? 0));
      if (resultado.acertou) {
        setAcertos((a) => a + 1);
      } else {
        setErros((e) => e + 1);
        setEstruturasErradas((atual) => [...atual, cartao.frente]);
      }
    });
  }

  if (concluido) {
    return (
      <div className="border-ornamental rounded-sm bg-paper-dark/40 p-8 text-center">
        <p className="font-hand text-3xl text-wine">Revisão concluída!</p>
        <p className="mt-2 text-ink-soft">
          Você revisou {revisados} {revisados === 1 ? "cartão" : "cartões"} — {acertos} acertos,{" "}
          {erros} {erros === 1 ? "erro" : "erros"} — e ganhou {xpAcumulado} XP.
        </p>
        {estruturasErradas.length > 0 && (
          <div className="mx-auto mt-4 max-w-sm text-left">
            <p className="font-hand-note mb-1 text-ink-soft">
              Estruturas para revisar com mais atenção:
            </p>
            <ul className="list-disc pl-5 text-sm text-ink">
              {estruturasErradas.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-hand-note text-sm text-ink-soft">
        Cartão {indice + 1} de {cartoes.length} — {cartao.pranchaTitulo}
      </p>

      {cartao.modoAtivo ? (
        <div className="notebook-page flex w-full max-w-lg flex-col items-center gap-4 rounded-sm px-8 py-8 text-center">
          <p className="font-hand text-2xl text-ink">{cartao.frente}</p>

          {cartao.imagemUrl && (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cartao.imagemUrl} alt="" className="mx-auto max-h-56 w-auto" />
              {cartao.marcadorX !== null && cartao.marcadorY !== null && (
                <Marcador x={cartao.marcadorX} y={cartao.marcadorY} />
              )}
            </div>
          )}

          {!feedbackAtivo && cartao.alternativas && cartao.alternativas.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              {cartao.alternativas.map((alternativa) => (
                <button
                  key={alternativa}
                  type="button"
                  disabled={pendente}
                  onClick={() => responderAtivo(alternativa)}
                  className="rounded-sm border border-line px-4 py-2.5 text-left text-ink hover:border-wine disabled:opacity-70"
                >
                  {alternativa}
                </button>
              ))}
            </div>
          )}

          {!feedbackAtivo && (!cartao.alternativas || cartao.alternativas.length === 0) && (
            <form
              className="flex w-full flex-col gap-2"
              onSubmit={(evento) => {
                evento.preventDefault();
                responderAtivo(respostaTexto);
              }}
            >
              <input
                type="text"
                value={respostaTexto}
                onChange={(evento) => setRespostaTexto(evento.target.value)}
                placeholder="Digite sua resposta…"
                className="rounded-sm border border-line px-3 py-2 text-ink outline-none focus:border-wine"
                disabled={pendente}
              />
              <button
                type="submit"
                disabled={pendente || !respostaTexto.trim()}
                className="rounded-sm bg-wine px-4 py-2 font-medium text-paper hover:bg-wine-dark disabled:opacity-50"
              >
                Responder
              </button>
            </form>
          )}

          {feedbackAtivo && (
            <div
              className={`w-full rounded-sm border p-4 text-left ${
                feedbackAtivo.acertou
                  ? "border-slate bg-postit-green/30"
                  : "border-wine bg-postit-pink/30"
              }`}
            >
              <p className="font-hand-note text-lg text-ink">
                {feedbackAtivo.acertou ? "Você acertou!" : "Não foi dessa vez."}
              </p>
              {!feedbackAtivo.acertou && (
                <p className="mt-1 text-sm text-ink">
                  Resposta correta: {feedbackAtivo.respostaCorreta}
                </p>
              )}
              <p className="mt-2 text-sm text-ink-soft">{feedbackAtivo.verso}</p>
              <button
                type="button"
                onClick={avancar}
                className="mt-4 rounded-sm bg-wine px-5 py-2 font-medium text-paper hover:bg-wine-dark"
              >
                Próxima carta →
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setVirado((v) => !v)}
            className="notebook-page flex min-h-[16rem] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-sm px-8 py-10 text-center transition-transform hover:-translate-y-0.5"
          >
            {!virado ? (
              <>
                <p className="font-hand text-2xl text-ink">{cartao.frente}</p>
                {cartao.imagemUrl && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cartao.imagemUrl} alt="" className="max-h-40 w-auto" />
                    {cartao.marcadorX !== null && cartao.marcadorY !== null && (
                      <Marcador x={cartao.marcadorX} y={cartao.marcadorY} />
                    )}
                  </div>
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
        </>
      )}
    </div>
  );
}
