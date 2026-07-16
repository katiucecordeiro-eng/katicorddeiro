import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HandDivider } from "@/components/notebook/HandDivider";

export const metadata: Metadata = { title: "Flashcards — Asterik" };

export default async function FlashcardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plano")
    .eq("id", user!.id)
    .single();
  const acessoTotal = profile?.plano === "black";

  const { data: sistemas } = await supabase
    .from("sistemas")
    .select("id, nome, ordem, pranchas(id, numero_prancha, titulo, disponivel_no_white)")
    .order("ordem");

  const { data: flashcards } = await supabase.from("flashcards").select("id, prancha_id");
  const { data: progresso } = await supabase
    .from("flashcard_progresso")
    .select("flashcard_id, proxima_revisao")
    .eq("user_id", user!.id);

  const proximaRevisaoPorCartao = new Map(
    (progresso ?? []).map((p) => [p.flashcard_id, p.proxima_revisao])
  );
  const hoje = new Date().toISOString().slice(0, 10);

  const contagemPorPrancha = new Map<string, number>();
  let totalGeral = 0;
  let totalDevidosHoje = 0;
  for (const f of flashcards ?? []) {
    contagemPorPrancha.set(f.prancha_id, (contagemPorPrancha.get(f.prancha_id) ?? 0) + 1);
    totalGeral += 1;
    const proximaRevisao = proximaRevisaoPorCartao.get(f.id);
    if (!proximaRevisao || proximaRevisao <= hoje) totalDevidosHoje += 1;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">Flashcards</h1>
        <p className="mt-1 text-ink-soft">
          Escolha um sistema, uma prancha, ou revise tudo de uma vez.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/flashcards/revisar?modo=devidos"
          className={`rounded-sm px-4 py-2.5 text-sm font-medium ${
            totalDevidosHoje > 0
              ? "bg-wine text-paper hover:bg-wine-dark"
              : "pointer-events-none border border-line text-ink-soft opacity-50"
          }`}
        >
          Revisar devidos hoje ({totalDevidosHoje})
        </Link>
        <Link
          href="/flashcards/revisar?modo=todos"
          className={`rounded-sm border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine ${
            totalGeral === 0 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Revisar tudo ({totalGeral})
        </Link>
      </div>

      {!sistemas?.length && <p className="text-ink-soft">Nenhum sistema cadastrado ainda.</p>}

      <div className="flex flex-col gap-10">
        {sistemas?.map((sistema) => {
          const pranchaIdsAcessiveis = (sistema.pranchas ?? [])
            .filter((p) => acessoTotal || p.disponivel_no_white)
            .map((p) => p.id);
          const totalNoSistema = pranchaIdsAcessiveis.reduce(
            (total, id) => total + (contagemPorPrancha.get(id) ?? 0),
            0
          );

          return (
            <section key={sistema.id}>
              <h2 className="font-hand text-3xl font-semibold text-wine">{sistema.nome}</h2>
              <HandDivider className="mb-4 max-w-[10rem]" />

              {totalNoSistema > 0 && (
                <div className="mb-5">
                  <Link
                    href={`/flashcards/revisar?sistema_id=${sistema.id}`}
                    className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
                  >
                    Revisar sistema inteiro ({totalNoSistema})
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sistema.pranchas?.length ? (
                  sistema.pranchas.map((prancha) => {
                    const bloqueada = !acessoTotal && !prancha.disponivel_no_white;
                    const total = contagemPorPrancha.get(prancha.id) ?? 0;
                    return (
                      <div
                        key={prancha.id}
                        className={`notebook-page rounded-sm p-4 ${bloqueada ? "opacity-60" : ""}`}
                      >
                        <p className="text-xs tracking-wide text-gold uppercase">
                          {prancha.numero_prancha}
                        </p>
                        <p className="font-hand-note mt-1 text-lg text-ink">{prancha.titulo}</p>
                        {bloqueada ? (
                          <p className="mt-2 text-xs font-medium text-slate-dark">
                            Disponível no plano Black
                          </p>
                        ) : total > 0 ? (
                          <Link
                            href={`/flashcards/revisar?prancha_id=${prancha.id}`}
                            className="mt-2 inline-block rounded-sm bg-paper-dark/60 px-2 py-1 text-xs text-ink-soft hover:bg-wine hover:text-paper"
                          >
                            Revisar ({total})
                          </Link>
                        ) : (
                          <p className="mt-2 text-xs text-ink-soft/70">Sem flashcards ainda</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-ink-soft">Nenhuma prancha cadastrada.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
