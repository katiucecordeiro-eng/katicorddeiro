"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/notebook/PageHeader";
import { salvarAnotacoes } from "@/app/(app)/estudar/[prancha_id]/actions";

type AnotacoesPageProps = {
  pranchaId: string;
  anotacoesIniciais: string;
};

export function AnotacoesPage({ pranchaId, anotacoesIniciais }: AnotacoesPageProps) {
  const [texto, setTexto] = useState(anotacoesIniciais);
  const [salvo, setSalvo] = useState(true);
  const [pending, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      await salvarAnotacoes(pranchaId, texto);
      setSalvo(true);
    });
  }

  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo="Anotações" titulo="Minhas Anotações" />

      <textarea
        value={texto}
        onChange={(evento) => {
          setTexto(evento.target.value);
          setSalvo(false);
        }}
        onBlur={salvar}
        placeholder="Escreva aqui o que quiser lembrar sobre esta prancha…"
        className="ruled-lines font-hand-note w-full resize-none border-none bg-transparent text-lg text-ink outline-none"
        style={{ minHeight: "60vh" }}
      />

      <div className="no-print mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={pending || salvo}
          className="rounded-sm bg-wine px-4 py-2 text-sm font-medium text-paper hover:bg-wine-dark disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar anotações"}
        </button>
        <span className="text-sm text-ink-soft">
          {pending ? "" : salvo ? "Salvo." : "Alterações não salvas."}
        </span>
      </div>
    </div>
  );
}
