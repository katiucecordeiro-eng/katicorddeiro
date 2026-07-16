"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  revisarFlashcard,
  responderFlashcardAtivo,
  salvarAnotacaoFlashcard,
  salvarReflexaoSessao,
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

type FeedbackAtivo = { acertou: boolean; respostaCorreta: string; verso: string; comentario: string };

const FRASES_ACERTO = ["Mandou bem!", "Isso aí!", "Show de bola!", "Na mosca!", "Você manda!"];
const FRASES_ERRO = [
  "Quase lá — vale revisar essa.",
  "Essa é pegadinha, revise com calma.",
  "Não desanime, anota essa pra rever.",
  "Acontece — bora fixar essa estrutura.",
];

function frasePara(acertou: boolean): string {
  const lista = acertou ? FRASES_ACERTO : FRASES_ERRO;
  return lista[Math.floor(Math.random() * lista.length)];
}

function agora(): number {
  return Date.now();
}

function hashString(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) | 0;
  }
  return h;
}

// Embaralha de forma determinística (semente = id do cartão), não com
// Math.random(): assim o servidor e o cliente calculam sempre a mesma
// ordem no primeiro render, sem erro de hidratação.
function embaralharComSemente<T>(lista: T[], semente: string): T[] {
  let estado = hashString(semente) || 1;
  function proximo() {
    estado ^= estado << 13;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    return (estado >>> 0) / 4294967296;
  }
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1));
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

type ResultadoResposta = { acertou: boolean; xpGanho: number; frente: string };

type CartaoAtivoProps = {
  cartao: CartaoDevido;
  numero: number;
  total: number;
  acertos: number;
  erros: number;
  xp: number;
  onResultado: (resultado: ResultadoResposta) => void;
  onAvancar: () => void;
};

// Um cartão inteiro, com todo o seu estado local (resposta selecionada,
// feedback, anotação). Montado com `key={cartao.id}` pelo componente pai —
// isso garante que, ao trocar de cartão, o React descarta esta instância
// e monta uma nova do zero, sem qualquer chance de estado "vazar" de um
// cartão para o outro.
function CartaoAtivo({
  cartao,
  numero,
  total,
  acertos,
  erros,
  xp,
  onResultado,
  onAvancar,
}: CartaoAtivoProps) {
  const [virado, setVirado] = useState(false);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [feedbackAtivo, setFeedbackAtivo] = useState<FeedbackAtivo | null>(null);
  const [anotacao, setAnotacao] = useState("");
  const [anotacaoSalva, setAnotacaoSalva] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();
  const respondendoRef = useRef(false);

  const [alternativas] = useState(() =>
    cartao.alternativas ? embaralharComSemente(cartao.alternativas, cartao.id) : null
  );

  const revisados = acertos + erros;

  function classificar(classificacao: Classificacao) {
    if (respondendoRef.current) return;
    respondendoRef.current = true;
    iniciarTransicao(async () => {
      const resultado = await revisarFlashcard(cartao.id, cartao.caixaAtual, classificacao);
      respondendoRef.current = false;
      onResultado({
        acertou: classificacao !== "errei",
        xpGanho: resultado.xpGanho ?? 0,
        frente: cartao.frente,
      });
      onAvancar();
    });
  }

  function responderAtivo(resposta: string) {
    if (respondendoRef.current || selecionada || feedbackAtivo || !resposta.trim()) return;
    respondendoRef.current = true;
    setSelecionada(resposta);
    iniciarTransicao(async () => {
      const resultado = await responderFlashcardAtivo(cartao.id, cartao.caixaAtual, resposta);
      respondendoRef.current = false;
      if (resultado.error || resultado.acertou === undefined) return;

      onResultado({
        acertou: resultado.acertou,
        xpGanho: resultado.xpGanho ?? 0,
        frente: cartao.frente,
      });
      setFeedbackAtivo({
        acertou: resultado.acertou,
        respostaCorreta: resultado.respostaCorreta ?? "",
        verso: resultado.verso ?? cartao.verso,
        comentario: frasePara(resultado.acertou),
      });
    });
  }

  function salvarAnotacao() {
    if (!anotacao.trim() || pendente) return;
    iniciarTransicao(async () => {
      await salvarAnotacaoFlashcard(cartao.id, anotacao.trim());
      setAnotacaoSalva(true);
    });
  }

  return (
    <div className="feedback-pop flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <p className="font-hand-note text-sm text-ink-soft">
          Cartão {numero} de {total} — {cartao.pranchaTitulo}
        </p>
        {revisados > 0 && (
          <p className="text-xs text-ink-soft">
            <span className="text-slate">✓ {acertos}</span> ·{" "}
            <span className="text-wine">✗ {erros}</span> · {xp} XP
          </p>
        )}
      </div>

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
              className={`feedback-pop w-full rounded-sm border p-4 text-left ${
                feedbackAtivo.acertou
                  ? "border-slate bg-postit-green/30"
                  : "border-wine bg-postit-pink/30"
              }`}
            >
              <p className="font-hand-note text-lg text-ink">
                {feedbackAtivo.acertou ? "Você acertou!" : "Não foi dessa vez."}{" "}
                <span className="text-base text-ink-soft">{feedbackAtivo.comentario}</span>
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

              <div className="mt-3 border-t border-line/60 pt-3">
                <label className="font-hand-note mb-1 block text-sm text-ink-soft">
                  Anotação sobre este cartão (opcional)
                </label>
                <textarea
                  value={anotacao}
                  onChange={(evento) => {
                    setAnotacao(evento.target.value);
                    setAnotacaoSalva(false);
                  }}
                  rows={2}
                  placeholder="Escreva algo que queira lembrar sobre essa estrutura…"
                  className="w-full rounded-sm border border-line px-3 py-2 text-sm text-ink outline-none focus:border-wine"
                />
                {anotacao.trim() && (
                  <button
                    type="button"
                    onClick={salvarAnotacao}
                    disabled={pendente || anotacaoSalva}
                    className="touch-manipulation mt-1 cursor-pointer rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-ink-soft select-none hover:border-wine hover:text-wine disabled:cursor-default disabled:opacity-60"
                  >
                    {anotacaoSalva ? "Anotação salva ✓" : pendente ? "Salvando…" : "Salvar anotação"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onAvancar}
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

type ResumoSessaoProps = {
  totalCartoes: number;
  acertos: number;
  erros: number;
  xpAcumulado: number;
  estruturasErradas: string[];
  tempoDecorridoSeg: number | null;
};

function ResumoSessao({
  totalCartoes,
  acertos,
  erros,
  xpAcumulado,
  estruturasErradas,
  tempoDecorridoSeg,
}: ResumoSessaoProps) {
  const [reflexao, setReflexao] = useState("");
  const [reflexaoSalva, setReflexaoSalva] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  const revisados = acertos + erros;
  const percentual = revisados > 0 ? Math.round((acertos / revisados) * 100) : 0;
  const comentarioFinal =
    revisados === 0
      ? ""
      : percentual >= 90
        ? "Desempenho excelente — você domina essa prancha!"
        : percentual >= 70
          ? "Muito bom! Só falta afinar alguns detalhes."
          : percentual >= 50
            ? "Bom começo — revise os pontos abaixo e tente de novo."
            : "Vale revisar com calma a teoria antes da próxima rodada.";

  const contagemErros = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of estruturasErradas) mapa.set(item, (mapa.get(item) ?? 0) + 1);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [estruturasErradas]);

  const minutos = tempoDecorridoSeg !== null ? Math.floor(tempoDecorridoSeg / 60) : null;
  const segundosResto = tempoDecorridoSeg !== null ? tempoDecorridoSeg % 60 : null;

  function salvarReflexao() {
    if (!reflexao.trim() || pendente) return;
    iniciarTransicao(async () => {
      await salvarReflexaoSessao({
        totalCartoes,
        acertos,
        erros,
        xpGanho: xpAcumulado,
        duracaoSegundos: tempoDecorridoSeg ?? 0,
        texto: reflexao,
      });
      setReflexaoSalva(true);
    });
  }

  return (
    <div className="feedback-pop border-ornamental mx-auto max-w-xl rounded-sm bg-paper-dark/40 p-8 text-center">
      <p className="font-hand text-3xl text-wine">Revisão concluída!</p>
      <p className="mt-2 text-ink-soft">
        Você revisou {revisados} {revisados === 1 ? "cartão" : "cartões"} — {acertos} acertos,{" "}
        {erros} {erros === 1 ? "erro" : "erros"} ({percentual}%) — e ganhou {xpAcumulado} XP.
        {minutos !== null && (
          <>
            {" "}
            Tempo: {minutos}min {segundosResto}s.
          </>
        )}
      </p>
      {comentarioFinal && <p className="font-hand-note mt-2 text-lg text-wine">{comentarioFinal}</p>}

      {contagemErros.length > 0 && (
        <div className="mx-auto mt-4 max-w-sm text-left">
          <p className="font-hand-note mb-1 text-ink-soft">
            Estruturas para revisar com mais atenção:
          </p>
          <ul className="list-disc pl-5 text-sm text-ink">
            {contagemErros.map(([item, n]) => (
              <li key={item}>
                {item}
                {n > 1 && ` (×${n})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto mt-6 max-w-sm text-left">
        <label className="font-hand-note mb-1 block text-ink-soft">
          Como foi essa sessão para você?
        </label>
        <textarea
          value={reflexao}
          onChange={(evento) => {
            setReflexao(evento.target.value);
            setReflexaoSalva(false);
          }}
          disabled={reflexaoSalva}
          rows={3}
          placeholder="Escreva um comentário sobre essa revisão…"
          className="w-full rounded-sm border border-line px-3 py-2 text-ink outline-none focus:border-wine disabled:opacity-60"
        />
        {!reflexaoSalva ? (
          <button
            type="button"
            onClick={salvarReflexao}
            disabled={pendente || !reflexao.trim()}
            className="touch-manipulation mt-2 cursor-pointer rounded-sm bg-wine px-4 py-2.5 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
          >
            {pendente ? "Salvando…" : "Salvar reflexão"}
          </button>
        ) : (
          <p className="mt-2 text-sm text-slate">Reflexão salva.</p>
        )}
      </div>
    </div>
  );
}

export function FlashcardReview({ cartoes }: { cartoes: CartaoDevido[] }) {
  const [indice, setIndice] = useState(0);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [estruturasErradas, setEstruturasErradas] = useState<string[]>([]);
  const [tempoInicio] = useState(agora);
  const [tempoDecorridoSeg, setTempoDecorridoSeg] = useState<number | null>(null);
  const [concluidoAnterior, setConcluidoAnterior] = useState(false);

  const concluido = indice >= cartoes.length;
  const cartao = cartoes[indice];

  if (concluido && !concluidoAnterior) {
    setConcluidoAnterior(true);
    setTempoDecorridoSeg(Math.round((agora() - tempoInicio) / 1000));
  }

  function registrarResultado({ acertou, xpGanho, frente }: ResultadoResposta) {
    setXpAcumulado((xp) => xp + xpGanho);
    if (acertou) {
      setAcertos((a) => a + 1);
    } else {
      setErros((e) => e + 1);
      setEstruturasErradas((atual) => [...atual, frente]);
    }
  }

  if (concluido) {
    return (
      <ResumoSessao
        totalCartoes={cartoes.length}
        acertos={acertos}
        erros={erros}
        xpAcumulado={xpAcumulado}
        estruturasErradas={estruturasErradas}
        tempoDecorridoSeg={tempoDecorridoSeg}
      />
    );
  }

  return (
    <CartaoAtivo
      key={cartao.id}
      cartao={cartao}
      numero={indice + 1}
      total={cartoes.length}
      acertos={acertos}
      erros={erros}
      xp={xpAcumulado}
      onResultado={registrarResultado}
      onAvancar={() => setIndice((i) => i + 1)}
    />
  );
}
