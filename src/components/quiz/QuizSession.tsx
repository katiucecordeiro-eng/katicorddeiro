"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registrarResposta, type RespostaEnviada } from "@/app/(app)/quiz/actions";

export type PerguntaSessao = {
  id: string;
  pergunta: string;
  tipo: "multipla_escolha" | "apontar_imagem";
  alternativas: string[] | { imagem_url: string };
  pranchaTitulo: string;
  pranchaNumero: string;
};

type Feedback = {
  acertou: boolean;
  respostaCorreta: string;
  explicacao: string | null;
};

export function QuizSession({ perguntas }: { perguntas: PerguntaSessao[] }) {
  const [indice, setIndice] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [pendente, iniciarTransicao] = useTransition();

  const pergunta = perguntas[indice];
  const concluido = indice >= perguntas.length;

  function enviarResposta(resposta: RespostaEnviada) {
    if (pendente || feedback) return;
    iniciarTransicao(async () => {
      const resultado = await registrarResposta(pergunta.id, resposta);
      if (resultado.error || resultado.acertou === undefined) return;
      setFeedback({
        acertou: resultado.acertou,
        respostaCorreta: resultado.respostaCorreta ?? "",
        explicacao: resultado.explicacao ?? null,
      });
      if (resultado.acertou) setAcertos((a) => a + 1);
      setXpTotal((xp) => xp + (resultado.xpGanho ?? 0));
    });
  }

  function proxima() {
    setFeedback(null);
    setIndice((i) => i + 1);
  }

  function clicarImagem(evento: React.MouseEvent<HTMLImageElement>) {
    if (feedback) return;
    const rect = evento.currentTarget.getBoundingClientRect();
    const x = (evento.clientX - rect.left) / rect.width;
    const y = (evento.clientY - rect.top) / rect.height;
    enviarResposta({ tipo: "apontar_imagem", valor: { x, y } });
  }

  if (!perguntas.length) {
    return (
      <div className="border-ornamental rounded-sm bg-paper-dark/40 p-6 text-center">
        <p className="text-ink-soft">Nenhuma pergunta disponível para essa seleção.</p>
        <Link
          href="/quiz"
          className="mt-3 inline-block rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
        >
          Voltar à seleção
        </Link>
      </div>
    );
  }

  if (concluido) {
    return (
      <div className="border-ornamental mx-auto max-w-lg rounded-sm bg-paper-dark/40 p-8 text-center">
        <p className="font-hand text-3xl text-wine">Quiz concluído!</p>
        <p className="mt-3 text-lg text-ink">
          Você acertou {acertos} de {perguntas.length} perguntas.
        </p>
        <p className="mt-1 text-ink-soft">Ganhou {xpTotal} XP nesta sessão.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-sm border border-line px-5 py-2.5 font-medium text-ink-soft hover:border-wine hover:text-wine"
          >
            Voltar à seleção
          </Link>
          <Link
            href="/ranking"
            className="rounded-sm bg-wine px-5 py-2.5 font-medium text-paper hover:bg-wine-dark"
          >
            Ver ranking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-hand-note text-sm text-ink-soft">
        Pergunta {indice + 1} de {perguntas.length} — {pergunta.pranchaNumero} ·{" "}
        {pergunta.pranchaTitulo}
      </p>

      <div className="notebook-page rounded-sm px-6 py-8">
        <p className="font-serif text-xl text-ink">{pergunta.pergunta}</p>

        {pergunta.tipo === "multipla_escolha" && Array.isArray(pergunta.alternativas) && (
          <div className="mt-6 flex flex-col gap-2">
            {pergunta.alternativas.map((alternativa) => {
              const ehCorreta = feedback && alternativa === feedback.respostaCorreta;
              return (
                <button
                  key={alternativa}
                  type="button"
                  disabled={pendente || !!feedback}
                  onClick={() => enviarResposta({ tipo: "multipla_escolha", valor: alternativa })}
                  className={`rounded-sm border px-4 py-2.5 text-left transition-colors ${
                    ehCorreta
                      ? "border-slate bg-postit-green/50 text-ink"
                      : "border-line text-ink hover:border-wine"
                  } disabled:opacity-70`}
                >
                  {alternativa}
                </button>
              );
            })}
          </div>
        )}

        {pergunta.tipo === "apontar_imagem" && !Array.isArray(pergunta.alternativas) && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-ink-soft">Clique no ponto correto na imagem:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pergunta.alternativas.imagem_url}
              alt="Ilustração da pergunta"
              onClick={clicarImagem}
              className="mx-auto max-h-[50vh] w-auto cursor-crosshair"
            />
          </div>
        )}

        {feedback && (
          <div
            className={`mt-6 rounded-sm border p-4 ${
              feedback.acertou ? "border-slate bg-postit-green/30" : "border-wine bg-postit-pink/30"
            }`}
          >
            <p className="font-hand-note text-lg text-ink">
              {feedback.acertou ? "Você acertou!" : "Não foi dessa vez."}
            </p>
            {!feedback.acertou && (
              <p className="mt-1 text-sm text-ink">Resposta correta: {feedback.respostaCorreta}</p>
            )}
            {feedback.explicacao && (
              <p className="mt-2 text-sm text-ink-soft">{feedback.explicacao}</p>
            )}
            <button
              type="button"
              onClick={proxima}
              className="mt-4 rounded-sm bg-wine px-5 py-2 font-medium text-paper hover:bg-wine-dark"
            >
              Próxima pergunta →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
