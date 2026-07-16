import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ranking — Asterik" };

type PageProps = {
  searchParams: Promise<{ sistema?: string }>;
};

const MEDALHAS = ["🥇", "🥈", "🥉"];

export default async function RankingPage({ searchParams }: PageProps) {
  const { sistema: sistemaSlug } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sistemas } = await supabase
    .from("sistemas")
    .select("slug, nome, ordem")
    .order("ordem");

  const { data: ranking } = await supabase.rpc("ranking", {
    filtro_sistema_slug: sistemaSlug ?? undefined,
  });

  const linhas = ranking ?? [];
  const top3 = linhas.slice(0, 3);
  const resto = linhas.slice(3);
  const minhaLinha = linhas.find((l) => l.user_id === user?.id);
  const dentroDoTop = top3.some((l) => l.user_id === user?.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">Ranking</h1>
        <p className="mt-1 text-ink-soft">
          Veja quem mais acumulou pontos estudando anatomia.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/ranking"
          className={`rounded-sm border px-3 py-1.5 text-sm font-medium ${
            !sistemaSlug
              ? "border-wine bg-wine text-paper"
              : "border-line text-ink-soft hover:border-wine"
          }`}
        >
          Geral
        </Link>
        {(sistemas ?? []).map((s) => (
          <Link
            key={s.slug}
            href={`/ranking?sistema=${s.slug}`}
            className={`rounded-sm border px-3 py-1.5 text-sm font-medium ${
              sistemaSlug === s.slug
                ? "border-wine bg-wine text-paper"
                : "border-line text-ink-soft hover:border-wine"
            }`}
          >
            {s.nome}
          </Link>
        ))}
      </div>

      {top3.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {top3.map((linha, indice) => (
            <div
              key={linha.user_id}
              className={`border-ornamental rounded-sm p-5 text-center ${
                linha.user_id === user?.id ? "bg-postit-yellow/40" : "bg-paper-dark/40"
              }`}
            >
              <p className="text-3xl">{MEDALHAS[indice]}</p>
              <p className="font-hand-note mt-1 text-lg text-ink">{linha.nome}</p>
              <p className="text-sm text-ink-soft">{linha.pontos_totais} pts</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-dark/60 text-ink-soft uppercase">
            <tr>
              <th className="px-4 py-2">Posição</th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {resto.length ? (
              resto.map((linha) => (
                <tr
                  key={linha.user_id}
                  className={`border-t border-line ${
                    linha.user_id === user?.id ? "bg-postit-yellow/30" : ""
                  }`}
                >
                  <td className="px-4 py-2">{linha.posicao}</td>
                  <td className="px-4 py-2">{linha.nome}</td>
                  <td className="px-4 py-2">{linha.pontos_totais}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-ink-soft">
                  {top3.length ? "Mais ninguém pontuou ainda." : "Ninguém pontuou ainda. Seja o primeiro!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!dentroDoTop && minhaLinha && (
        <div className="border-ornamental rounded-sm bg-slate/10 p-4 text-center">
          <p className="text-sm text-ink-soft">Sua posição atual</p>
          <p className="font-hand-note text-xl text-ink">
            #{minhaLinha.posicao} — {minhaLinha.pontos_totais} pts
          </p>
        </div>
      )}
    </div>
  );
}
