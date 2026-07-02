"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = { error: null };

export function CadastroForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-ink-soft">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-wine"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-wine"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-soft">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-wine"
        />
      </div>

      {state.error && (
        <p className="text-sm text-wine" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="text-sm text-slate-dark" role="status">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-wine px-4 py-2.5 font-medium text-paper transition-colors hover:bg-wine-dark disabled:opacity-60"
      >
        {pending ? "Criando conta…" : "Criar conta"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-slate hover:text-slate-dark">
          Entrar
        </Link>
      </p>
    </form>
  );
}
