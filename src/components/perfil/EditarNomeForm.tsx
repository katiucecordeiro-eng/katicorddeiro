"use client";

import { useActionState } from "react";
import { atualizarNome, type PerfilState } from "@/app/(app)/perfil/actions";

const initialState: PerfilState = { error: null };

export function EditarNomeForm({ nomeAtual }: { nomeAtual: string }) {
  const [state, formAction, pending] = useActionState(atualizarNome, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="nome" className="text-sm font-medium text-ink-soft">
        Nome
      </label>
      <div className="flex gap-2">
        <input
          id="nome"
          name="nome"
          type="text"
          defaultValue={nomeAtual}
          required
          className="flex-1 rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-wine"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-wine px-4 py-2 font-medium text-paper hover:bg-wine-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
      {state.error && (
        <p className="text-sm text-wine" role="alert">
          {state.error}
        </p>
      )}
      {state.sucesso && (
        <p className="text-sm text-slate-dark" role="status">
          Nome atualizado.
        </p>
      )}
    </form>
  );
}
