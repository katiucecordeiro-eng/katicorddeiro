"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/SignOutButton";

type AppShellProps = {
  nome: string;
  plano: "white" | "black";
  children: React.ReactNode;
};

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-wine text-paper"
                : "text-ink-soft hover:bg-paper-dark hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ nome, plano, children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const planoLabel = plano === "black" ? "Plano Black" : "Plano White";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper-dark/50 p-6 md:flex">
        <Link href="/dashboard" className="mb-8 font-serif text-3xl font-semibold text-wine">
          Asterik
        </Link>
        <NavLinks pathname={pathname} />
        <div className="mt-8 border-t border-line pt-4">
          <p className="truncate text-sm font-medium text-ink">{nome}</p>
          <p className="mb-3 text-xs tracking-wide text-gold uppercase">{planoLabel}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="flex items-center justify-between border-b border-line bg-paper-dark/50 px-4 py-3 md:hidden">
        <Link href="/dashboard" className="font-serif text-2xl font-semibold text-wine">
          Asterik
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Abrir menu"
          className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink"
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-b border-line bg-paper-dark/50 p-4 md:hidden">
          <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          <div className="border-t border-line pt-4">
            <p className="truncate text-sm font-medium text-ink">{nome}</p>
            <p className="mb-3 text-xs tracking-wide text-gold uppercase">{planoLabel}</p>
            <SignOutButton />
          </div>
        </div>
      )}

      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
