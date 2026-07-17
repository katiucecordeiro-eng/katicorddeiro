"use client";

import { useState, useTransition } from "react";
import { marcarHabitoManual } from "@/lib/actions/estudo";
import { calcularStreaks, isoDeData } from "@/lib/habitos";

export type HabitoDia = {
  data: string;
  cumprido: boolean;
  minutos_estudados: number;
};

const NOMES_DIA_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

type HabitoTrackerProps = {
  habitos: HabitoDia[];
  diasGrade?: number;
  jaMarcadoHoje: boolean;
  compacto?: boolean;
};

export function HabitoTracker({
  habitos,
  diasGrade = 70,
  jaMarcadoHoje,
  compacto = false,
}: HabitoTrackerProps) {
  const [marcado, setMarcado] = useState(jaMarcadoHoje);
  const [pendente, iniciarTransicao] = useTransition();

  const mapa = new Map(habitos.map((h) => [h.data, h]));
  const hoje = new Date();
  const sequencia: { data: Date; info?: HabitoDia }[] = [];
  for (let i = diasGrade - 1; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    sequencia.push({ data, info: mapa.get(isoDeData(data)) });
  }

  const { atual, melhor } = calcularStreaks(
    sequencia.map((d) => ({ cumprido: Boolean(d.info?.cumprido) }))
  );

  const offset = sequencia[0].data.getDay();
  const celulas: ({ data: Date; info?: HabitoDia } | null)[] = [
    ...Array(offset).fill(null),
    ...sequencia,
  ];

  function marcarPapel() {
    if (pendente) return;
    const novoValor = !marcado;
    setMarcado(novoValor);
    iniciarTransicao(async () => {
      await marcarHabitoManual(novoValor, "colorir");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="text-center">
          <p className="font-hand text-4xl font-semibold text-wine">🔥 {atual}</p>
          <p className="text-xs tracking-wide text-ink-soft uppercase">Dias seguidos</p>
        </div>
        <div className="text-center">
          <p className="font-hand text-4xl font-semibold text-gold">🏆 {melhor}</p>
          <p className="text-xs tracking-wide text-ink-soft uppercase">Melhor sequência</p>
        </div>
        <button
          type="button"
          onClick={marcarPapel}
          disabled={pendente}
          className={`touch-manipulation ml-auto cursor-pointer rounded-sm border px-4 py-2.5 text-sm font-medium select-none active:scale-[0.99] disabled:cursor-default disabled:opacity-60 ${
            marcado
              ? "border-slate bg-postit-green/40 text-ink"
              : "border-line text-ink-soft hover:border-wine hover:text-wine"
          }`}
        >
          {marcado ? "✓ Estudei no papel hoje" : "Estudei no papel hoje"}
        </button>
      </div>

      <div>
        {!compacto && (
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
            {NOMES_DIA_SEMANA.map((nome, indice) => (
              <span key={indice}>{nome}</span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {celulas.map((celula, indice) => {
            if (!celula) return <span key={indice} />;
            const cumprido = Boolean(celula.info?.cumprido);
            const ehHoje = isoDeData(celula.data) === isoDeData(hoje);
            return (
              <span
                key={indice}
                title={`${celula.data.toLocaleDateString("pt-BR")}${
                  celula.info?.minutos_estudados ? ` — ${celula.info.minutos_estudados}min` : ""
                }`}
                className={`flex aspect-square items-center justify-center rounded-sm border text-xs ${
                  cumprido
                    ? "border-wine bg-postit-green/50 text-wine"
                    : ehHoje
                      ? "border-gold border-dashed text-ink-soft/40"
                      : "border-line text-ink-soft/30"
                }`}
              >
                {cumprido ? "✓" : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
