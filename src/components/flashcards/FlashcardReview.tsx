"use client";

import { useMemo, useState, useTransition } from "react";
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
  marcadorNumero: number | null;
  tipo: "visual" | "conceitual";
  explicacao: string | null;
  pranchaTitulo: string;
  caixaAtual: number;
  alternativas: string[] | null;
  modoAtivo: boolean;
};

type FeedbackAtivo = { acertou: boolean; respostaCorreta: string; verso: string };

function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

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
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [feedbackAtivo, setFeedbackAtivo] = useState<FeedbackAtivo | null>(null);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [estruturasErradas, setEstruturasErradas] = useState<string[]>([]);
  const [pendente, iniciarTransicao] = useTransition();

  const cartao = cartoes[indice];
  const concluido = indice >= cartoes.length;
  const revisados = acertos + erros;

  const alternativas = useMemo(
    () => (cartao?.alternativas ? embaralhar(cartao.alternativas) : null),
    [cartao]
  );

  function avancar() {
    setVirado(false);
    setRespostaTexto("");
    setSelecionada(null);
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
    if (!cartao || pendente || selecionada || feedbackAtivo || !resposta.trim()) return;
    setSelecionada(resposta);
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
        <div className="notebook-page flex w-full max-w-xl flex-col items-center gap-4 rounded-sm px-5 py-6 text-center sm:px-8 sm:py-8">
          <p className="font-hand text-2xl text-ink">{cartao.frente}</p>

          {cartao.imagemUrl && (
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-sm border border-line bg-paper-dark/20 sm:max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cartao.imagemUrl} alt="" className="h-full w-full object-contain" />
              {cartao.marcadorX !== null && cartao.marcadorY !== null && (
                <Marcador x={cartao.marcadorX} y={cartao.marcadorY} />
              )}
            </div>
          )}
          {cartao.marcadorNumero !== null && (
            <p className="text-xs tracking-wide text-gold uppercase">
              Marcador nº {cartao.marcadorNumero}
            </p>
          )}

          {alternativas && alternativas.length > 0 && (
            <div className="flex w-full flex-col gap-2.5">
              {alternativas.map((alternativa) => {
                const ehCorreta = feedbackAtivo && alternativa === feedbackAtivo.respostaCorreta;
                const ehSelecionadaErrada =
                  feedbackAtivo && !feedbackAtivo.acertou && alternativa === selecionada;
                const aguardando = !feedbackAtivo && alternativa === selecionada;
                return (
                  <button
                    key={alternativa}
                    type="button"
                    disabled={pendente || Boolean(selecionada)}
                    onClick={() => responderAtivo(alternativa)}
                    className={`touch-manipulation rounded-sm border px-4 py-3.5 text-left text-base text-ink transition-colors select-none active:scale-[0.99] disabled:opacity-100 ${
                      ehCorreta
                        ? "border-slate bg-postit-green/40"
                        : ehSelecionadaErrada
                          ? "border-wine bg-postit-pink/40"
                          : aguardando
                            ? "border-gold bg-gold/10"
                            : "cursor-pointer border-line hover:border-wine hover:bg-paper-dark/30 disabled:cursor-default disabled:opacity-60"
                    }`}
                  >
                    {alternativa}
                    {ehCorreta && " ✓"}
                    {ehSelecionadaErrada && " ✗"}
                    {aguardando && " …"}
                  </button>
                );
              })}
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
                className="rounded-sm border border-line px-3 py-3 text-base text-ink outline-none focus:border-wine"
                disabled={pendente}
              />
              <button
                type="submit"
                disabled={pendente || !respostaTexto.trim()}
                className="touch-manipulation cursor-pointer rounded-sm bg-wine px-4 py-3 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
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
              <p className="mt-1 text-sm font-medium text-ink">
                Resposta correta: {feedbackAtivo.respostaCorreta}
              </p>
              {feedbackAtivo.verso && (
                <div className="mt-2">
                  <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                    Por quê
                  </p>
                  <p className="text-sm text-ink-soft">{feedbackAtivo.verso}</p>
                </div>
              )}
              {cartao.explicacao && (
                <p className="mt-2 text-sm text-ink-soft italic">{cartao.explicacao}</p>
              )}
              <button
                type="button"
                onClick={avancar}
                className="touch-manipulation mt-4 cursor-pointer rounded-sm bg-wine px-5 py-3 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99]"
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
            className="notebook-page touch-manipulation flex min-h-[16rem] w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-4 rounded-sm px-6 py-8 text-center transition-transform select-none hover:-translate-y-0.5 active:scale-[0.99] sm:px-8 sm:py-10"
          >
            {!virado ? (
              <>
                <p className="font-hand text-2xl text-ink">{cartao.frente}</p>
                {cartao.imagemUrl && (
                  <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-sm border border-line bg-paper-dark/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cartao.imagemUrl} alt="" className="h-full w-full object-contain" />
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
                className="touch-manipulation cursor-pointer rounded-sm bg-wine px-5 py-3 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99] disabled:opacity-50"
              >
                Errei
              </button>
              <button
                type="button"
                disabled={pendente}
                onClick={() => classificar("dificil")}
                className="touch-manipulation cursor-pointer rounded-sm bg-gold px-5 py-3 font-medium text-ink select-none hover:bg-gold-soft active:scale-[0.99] disabled:opacity-50"
              >
                Difícil
              </button>
              <button
                type="button"
                disabled={pendente}
                onClick={() => classificar("facil")}
                className="touch-manipulation cursor-pointer rounded-sm bg-slate px-5 py-3 font-medium text-paper select-none hover:bg-slate-dark active:scale-[0.99] disabled:opacity-50"
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
