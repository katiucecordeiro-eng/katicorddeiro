"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tipo = "foco" | "descanso";

const DURACOES: Record<Tipo, number> = {
  foco: 25,
  descanso: 5,
};

export function PomodoroTimer() {
  const [tipo, setTipo] = useState<Tipo>("foco");
  const [segundosRestantes, setSegundosRestantes] = useState(DURACOES.foco * 60);
  const [rodando, setRodando] = useState(false);
  const iniciadoEmRef = useRef<string | null>(null);

  const finalizarSessao = useCallback(async () => {
    setRodando(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !iniciadoEmRef.current) return;

    await supabase.from("sessoes_pomodoro").insert({
      user_id: user.id,
      duracao_minutos: DURACOES[tipo],
      tipo,
      iniciado_em: iniciadoEmRef.current,
      finalizado_em: new Date().toISOString(),
    });
    iniciadoEmRef.current = null;
  }, [tipo]);

  useEffect(() => {
    if (!rodando) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((segundos) => {
        if (segundos <= 1) {
          clearInterval(intervalo);
          finalizarSessao();
          return 0;
        }
        return segundos - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [rodando, finalizarSessao]);

  function iniciar() {
    if (!rodando) {
      iniciadoEmRef.current = new Date().toISOString();
    }
    setRodando(true);
  }

  function pausar() {
    setRodando(false);
  }

  function reiniciar(novoTipo: Tipo = tipo) {
    setRodando(false);
    setTipo(novoTipo);
    setSegundosRestantes(DURACOES[novoTipo] * 60);
    iniciadoEmRef.current = null;
  }

  const minutos = Math.floor(segundosRestantes / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (segundosRestantes % 60).toString().padStart(2, "0");

  return (
    <div className="border-ornamental flex flex-col items-center gap-6 rounded-sm bg-paper-dark/40 p-10">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => reiniciar("foco")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
            tipo === "foco" ? "bg-wine text-paper" : "text-ink-soft hover:bg-paper-dark"
          }`}
        >
          Foco (25min)
        </button>
        <button
          type="button"
          onClick={() => reiniciar("descanso")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
            tipo === "descanso" ? "bg-slate text-paper" : "text-ink-soft hover:bg-paper-dark"
          }`}
        >
          Descanso (5min)
        </button>
      </div>

      <p className="font-serif text-7xl font-semibold tabular-nums text-ink">
        {minutos}:{segundos}
      </p>

      <div className="flex gap-3">
        {!rodando ? (
          <button
            type="button"
            onClick={iniciar}
            className="rounded-sm bg-wine px-6 py-2.5 font-medium text-paper hover:bg-wine-dark"
          >
            Iniciar
          </button>
        ) : (
          <button
            type="button"
            onClick={pausar}
            className="rounded-sm bg-slate px-6 py-2.5 font-medium text-paper hover:bg-slate-dark"
          >
            Pausar
          </button>
        )}
        <button
          type="button"
          onClick={() => reiniciar()}
          className="rounded-sm border border-line px-6 py-2.5 font-medium text-ink-soft hover:border-wine hover:text-wine"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
