"use client";

import { useTransition } from "react";
import { logout } from "@/app/(auth)/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="text-sm font-medium text-ink-soft transition-colors hover:text-wine disabled:opacity-60"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
