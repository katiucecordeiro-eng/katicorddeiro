import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookCover } from "@/components/cadernos/BookCover";
import { HandDivider } from "@/components/notebook/HandDivider";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Caderno — Asterik" };

export default async function CadernoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cadernoCompleto } = await supabase
    .from("cadernos")
    .select("id, titulo, descricao, numero_paginas, capa_url, pdf_url")
    .eq("id", id)
    .maybeSingle();

  let teaser: {
    id: string;
    titulo: string;
    descricao: string | null;
    numero_paginas: number | null;
    capa_url: string | null;
  } | null = null;

  if (!cadernoCompleto) {
    const { data: catalogo } = await supabase.rpc("cadernos_catalogo");
    teaser = catalogo?.find((item) => item.id === id) ?? null;
    if (!teaser) {
      notFound();
    }
  }

  const caderno = cadernoCompleto ?? teaser!;
  const bloqueado = !cadernoCompleto;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/cadernos" className="text-sm text-ink-soft hover:text-wine">
        ← Voltar aos cadernos
      </Link>

      <div className="border-ornamental grid grid-cols-1 gap-8 rounded-sm bg-paper-dark/30 p-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:p-10">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border-l-[6px] border-gold shadow-md">
          <BookCover capaUrl={caderno.capa_url} titulo={caderno.titulo} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-hand text-4xl font-semibold text-wine">
              {caderno.titulo}
            </h1>
            <HandDivider className="mt-2 max-w-xs" />
          </div>

          {caderno.numero_paginas && (
            <p className="text-xs tracking-wide text-gold uppercase">
              {caderno.numero_paginas} páginas
            </p>
          )}

          {caderno.descricao && (
            <p className="font-serif text-lg leading-relaxed text-ink">
              {caderno.descricao}
            </p>
          )}

          {bloqueado ? (
            <div className="mt-2 flex flex-col items-start gap-3 rounded-sm bg-ink/5 p-4">
              <p className="font-hand-note text-lg text-ink-soft">
                🔒 Este caderno é exclusivo do plano Black.
              </p>
              <Link
                href="/perfil"
                className="rounded-sm bg-wine px-5 py-2.5 font-medium text-paper hover:bg-wine-dark"
              >
                Desbloquear no plano Black
              </Link>
            </div>
          ) : cadernoCompleto?.pdf_url ? (
            <a
              href={cadernoCompleto.pdf_url}
              download
              className="mt-2 inline-block w-fit rounded-sm bg-wine px-5 py-2.5 font-medium text-paper hover:bg-wine-dark"
            >
              Baixar PDF para imprimir
            </a>
          ) : (
            <p className="font-hand-note mt-2 text-ink-soft">
              O PDF deste caderno ainda está sendo preparado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
