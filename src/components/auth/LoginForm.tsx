"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          autoComplete="current-password"
          required
          className="rounded-sm border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-wine"
        />
      </div>

      {state.error && (
        <p className="text-sm text-wine" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-wine px-4 py-2.5 font-medium text-paper transition-colors hover:bg-wine-dark disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-slate hover:text-slate-dark">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
