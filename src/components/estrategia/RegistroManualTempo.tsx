"use client";

import { useState, useTransition } from "react";
import { registrarTempoEstudo, type FormatoEstudo } from "@/lib/actions/estudo";

const OPCOES: { valor: Extract<FormatoEstudo, "colorir" | "leitura">; rotulo: string }[] = [
  { valor: "colorir", rotulo: "Colorir no papel" },
  { valor: "leitura", rotulo: "Leitura" },
];

export function RegistroManualTempo() {
  const [tipo, setTipo] = useState<FormatoEstudo>("colorir");
  const [minutos, setMinutos] = useState(30);
  const [confirmado, setConfirmado] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function registrar() {
    if (minutos <= 0 || pendente) return;
    iniciarTransicao(async () => {
      await registrarTempoEstudo(tipo, minutos);
      setConfirmado(true);
      setTimeout(() => setConfirmado(false), 3000);
    });
  }

  return (
    <div className="notebook-page flex flex-col gap-3 rounded-sm p-5">
      <h3 className="font-hand text-xl font-semibold text-wine">Registrar tempo manualmente</h3>
      <p className="text-sm text-ink-soft">
        Para o tempo que você passa estudando fora do app, como colorir no book impresso.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Atividade
          <select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value as FormatoEstudo)}
            className="rounded-sm border border-line px-2 py-1.5 outline-none focus:border-wine"
          >
            {OPCOES.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Minutos
          <input
            type="number"
            min={1}
            step={5}
            value={minutos}
            onChange={(evento) => setMinutos(Number(evento.target.value))}
            className="w-24 rounded-sm border border-line px-2 py-1.5 outline-none focus:border-wine"
          />
        </label>
        <button
          type="button"
          onClick={registrar}
          disabled={pendente || minutos <= 0}
          className="touch-manipulation cursor-pointer rounded-sm bg-wine px-4 py-2 font-medium text-paper select-none hover:bg-wine-dark active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
        >
          {pendente ? "Registrando…" : "Registrar"}
        </button>
        {confirmado && <span className="text-sm text-slate">Registrado ✓</span>}
      </div>
    </div>
  );
}
