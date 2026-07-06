"use client";

import Link from "next/link";
import { BookCover } from "@/components/cadernos/BookCover";

export type CadernoResumo = {
  id: string;
  titulo: string;
  descricao: string | null;
  numero_paginas: number | null;
  capa_url: string | null;
  disponivel_no_white: boolean;
};

type CadernoCardProps = {
  caderno: CadernoResumo;
  bloqueado: boolean;
  selecionado: boolean;
  onToggleSelecao: () => void;
};

export function CadernoCard({
  caderno,
  bloqueado,
  selecionado,
  onToggleSelecao,
}: CadernoCardProps) {
  const conteudoCartao = (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm border-l-[6px] border-gold shadow-md transition-transform group-hover:-translate-y-1 group-hover:shadow-lg">
        <BookCover capaUrl={caderno.capa_url} titulo={caderno.titulo} />

        {bloqueado && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 px-4 text-center">
            <span className="text-3xl">🔒</span>
            <span className="font-hand-note text-sm text-paper">
              Disponível no plano Black
            </span>
            <Link
              href="/perfil"
              onClick={(evento) => evento.stopPropagation()}
              className="mt-1 rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gold-soft"
            >
              Desbloquear no plano Black
            </Link>
          </div>
        )}

        {!bloqueado && (
          <button
            type="button"
            onClick={(evento) => {
              evento.preventDefault();
              evento.stopPropagation();
              onToggleSelecao();
            }}
            aria-pressed={selecionado}
            aria-label={selecionado ? "Remover da seleção" : "Selecionar caderno"}
            className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
              selecionado
                ? "border-wine bg-wine text-paper"
                : "border-paper bg-paper/80 text-ink-soft hover:border-wine"
            }`}
          >
            {selecionado ? "✓" : ""}
          </button>
        )}
      </div>

      <div>
        <p className="font-hand-note text-lg text-ink">{caderno.titulo}</p>
        {caderno.numero_paginas && (
          <p className="text-xs tracking-wide text-gold uppercase">
            {caderno.numero_paginas} páginas
          </p>
        )}
        {caderno.descricao && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{caderno.descricao}</p>
        )}
      </div>
    </div>
  );

  if (bloqueado) {
    return <div>{conteudoCartao}</div>;
  }

  return <Link href={`/cadernos/${caderno.id}`}>{conteudoCartao}</Link>;
}
