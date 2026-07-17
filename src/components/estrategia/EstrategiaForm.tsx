"use client";

import { useState, useTransition } from "react";
import {
  salvarEstrategia,
  type FormatoEstudo,
  type FormatoRotina,
  type MetasEstudo,
} from "@/lib/actions/estudo";

type FormatoConfiguravel = Exclude<FormatoEstudo, "pomodoro">;

const ORDEM: FormatoConfiguravel[] = ["leitura", "colorir", "quiz", "flashcards"];

const FORMATOS_INFO: Record<
  FormatoConfiguravel,
  { emoji: string; titulo: string; descricao: string }
> = {
  leitura: {
    emoji: "📖",
    titulo: "Leitura do conteúdo",
    descricao:
      "O texto descritivo de cada prancha — tabelas de componente/característica, pontos clínicos e instruções de estudo. É por onde entender a matéria antes de decorar.",
  },
  colorir: {
    emoji: "🖍️",
    titulo: "Colorir no papel",
    descricao:
      "Colorir as ilustrações no seu book impresso — fixação visual e motora, no seu ritmo, sem tela. Marque aqui o tempo que pretende dedicar; o registro em si é manual.",
  },
  quiz: {
    emoji: "❓",
    titulo: "Quiz",
    descricao:
      "Perguntas de múltipla escolha e \"aponte na imagem\", com repetição espaçada: o que você mais erra reaparece com mais frequência.",
  },
  flashcards: {
    emoji: "🗂️",
    titulo: "Flashcards",
    descricao:
      "Cartões de pergunta e resposta com o sistema Leitner de 5 caixas — ótimo para memorização e revisão rápida do que já foi estudado.",
  },
};

function formatosParaMinutos(formatos: FormatoRotina[]): Record<FormatoConfiguravel, number> {
  const mapa = new Map(formatos.map((f) => [f.tipo, f.minutos]));
  return Object.fromEntries(ORDEM.map((tipo) => [tipo, mapa.get(tipo) ?? 0])) as Record<
    FormatoConfiguravel,
    number
  >;
}

type EstrategiaFormProps = {
  formatosIniciais: FormatoRotina[];
  metasIniciais: MetasEstudo;
  sistemas: { slug: string; nome: string }[];
};

export function EstrategiaForm({
  formatosIniciais,
  metasIniciais,
  sistemas,
}: EstrategiaFormProps) {
  const [minutos, setMinutos] = useState<Record<FormatoConfiguravel, number>>(
    formatosParaMinutos(formatosIniciais)
  );
  const [metaDiaria, setMetaDiaria] = useState(metasIniciais.metaDiariaMinutos ?? 0);
  const [metaSemanal, setMetaSemanal] = useState(metasIniciais.metaSemanalMinutos ?? 0);
  const [sistemasFoco, setSistemasFoco] = useState<string[]>(metasIniciais.sistemasFoco);
  const [salvo, setSalvo] = useState(true);
  const [pendente, iniciarTransicao] = useTransition();

  const totalMinutosDia = ORDEM.reduce((soma, tipo) => soma + (minutos[tipo] || 0), 0);
  const horas = Math.floor(totalMinutosDia / 60);
  const minutosResto = totalMinutosDia % 60;

  function alterarMinutos(tipo: FormatoConfiguravel, valor: number) {
    setMinutos((atual) => ({ ...atual, [tipo]: Math.max(0, valor) }));
    setSalvo(false);
  }

  function alternarSistema(slug: string) {
    setSistemasFoco((atual) =>
      atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]
    );
    setSalvo(false);
  }

  function salvar() {
    iniciarTransicao(async () => {
      await salvarEstrategia(
        ORDEM.map((tipo) => ({ tipo, minutos: minutos[tipo] || 0 })),
        {
          metaDiariaMinutos: metaDiaria || null,
          metaSemanalMinutos: metaSemanal || null,
          sistemasFoco,
        }
      );
      setSalvo(true);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ORDEM.map((tipo) => {
          const info = FORMATOS_INFO[tipo];
          return (
            <div key={tipo} className="notebook-page flex flex-col gap-2 rounded-sm p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{info.emoji}</span>
                <h3 className="font-hand text-xl font-semibold text-wine">{info.titulo}</h3>
              </div>
              <p className="text-sm text-ink-soft">{info.descricao}</p>
              <label className="mt-2 flex items-center gap-2 text-sm text-ink">
                Minutos por dia
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={minutos[tipo]}
                  onChange={(evento) => alterarMinutos(tipo, Number(evento.target.value))}
                  className="w-24 rounded-sm border border-line px-2 py-1 text-right outline-none focus:border-wine"
                />
              </label>
            </div>
          );
        })}
      </div>

      <p className="font-hand-note text-center text-lg text-ink-soft">
        Sua rotina diária soma{" "}
        <span className="font-semibold text-wine">
          {horas > 0 && `${horas}h `}
          {minutosResto}min
        </span>
        .
      </p>

      <div className="notebook-page flex flex-col gap-4 rounded-sm p-5">
        <h3 className="font-hand text-xl font-semibold text-wine">Metas</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Meta diária (minutos)
            <input
              type="number"
              min={0}
              step={5}
              value={metaDiaria}
              onChange={(evento) => {
                setMetaDiaria(Number(evento.target.value));
                setSalvo(false);
              }}
              className="rounded-sm border border-line px-2 py-1.5 outline-none focus:border-wine"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Meta semanal (minutos)
            <input
              type="number"
              min={0}
              step={15}
              value={metaSemanal}
              onChange={(evento) => {
                setMetaSemanal(Number(evento.target.value));
                setSalvo(false);
              }}
              className="rounded-sm border border-line px-2 py-1.5 outline-none focus:border-wine"
            />
          </label>
        </div>

        {sistemas.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-ink">Sistemas em foco (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {sistemas.map((sistema) => {
                const ativo = sistemasFoco.includes(sistema.slug);
                return (
                  <button
                    key={sistema.slug}
                    type="button"
                    onClick={() => alternarSistema(sistema.slug)}
                    className={`touch-manipulation cursor-pointer rounded-sm border px-3 py-1.5 text-sm font-medium select-none ${
                      ativo
                        ? "border-wine bg-wine text-paper"
                        : "border-line text-ink-soft hover:border-wine"
                    }`}
                  >
                    {sistema.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={pendente || salvo}
          className="touch-manipulation cursor-pointer rounded-sm bg-wine px-5 py-2.5 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
        >
          {pendente ? "Salvando…" : "Salvar estratégia"}
        </button>
        <span className="text-sm text-ink-soft">
          {pendente ? "" : salvo ? "Salvo." : "Alterações não salvas."}
        </span>
      </div>
    </div>
  );
}
