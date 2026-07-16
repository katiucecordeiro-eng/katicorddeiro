import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HandDivider } from "@/components/notebook/HandDivider";
import { PontoClinico } from "@/components/notebook/PontoClinico";
import { normalizarConteudoSistema } from "@/components/notebook/theory-types";

export const metadata: Metadata = { title: "Biblioteca de Pranchas — Asterik" };

export default async function BibliotecaPage() {
  const supabase = await createClient();

  const { data: sistemas } = await supabase
    .from("sistemas")
    .select(
      "id, nome, ordem, conteudo_teorico, pranchas(id, numero_prancha, titulo, disponivel_no_white)"
    )
    .order("ordem");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plano")
    .eq("id", user!.id)
    .single();

  const acessoTotal = profile?.plano === "black";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">
          Biblioteca de Pranchas
        </h1>
        <p className="mt-1 text-ink-soft">
          Escolha um sistema anatômico para abrir o caderno e começar a estudar.
        </p>
      </div>

      {!sistemas?.length && (
        <p className="text-ink-soft">Nenhum sistema cadastrado ainda.</p>
      )}

      <div className="flex flex-col gap-8">
        {sistemas?.map((sistema) => {
          const { fechamento } = normalizarConteudoSistema(sistema.conteudo_teorico);
          return (
          <section key={sistema.id}>
            <h2 className="font-hand text-3xl font-semibold text-wine">
              {sistema.nome}
            </h2>
            <HandDivider className="mb-3 max-w-[10rem]" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sistema.pranchas?.length ? (
                sistema.pranchas.map((prancha) => {
                  const bloqueada = !acessoTotal && !prancha.disponivel_no_white;
                  const conteudo = (
                    <div
                      className={`notebook-page rounded-sm p-4 transition-colors ${
                        bloqueada ? "opacity-60" : "hover:border-wine"
                      }`}
                    >
                      <p className="text-xs tracking-wide text-gold uppercase">
                        {prancha.numero_prancha}
                      </p>
                      <p className="font-hand-note mt-1 text-lg text-ink">
                        {prancha.titulo}
                      </p>
                      {bloqueada && (
                        <p className="mt-2 text-xs font-medium text-slate-dark">
                          Disponível no plano Black
                        </p>
                      )}
                    </div>
                  );

                  return bloqueada ? (
                    <div key={prancha.id}>{conteudo}</div>
                  ) : (
                    <Link key={prancha.id} href={`/estudar/${prancha.id}`}>
                      {conteudo}
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-ink-soft">Nenhuma prancha cadastrada.</p>
              )}
            </div>

            {fechamento && (
              <div className="notebook-page mt-4 rounded-sm px-6 py-6">
                <p className="font-hand-note mb-3 text-lg text-wine">
                  Fechando o {sistema.nome}
                </p>
                <p className="font-serif text-ink">{fechamento.texto}</p>
                {fechamento.pontos_clinicos.length > 0 && (
                  <div className="mt-4 flex flex-col gap-3">
                    {fechamento.pontos_clinicos.map((texto, indice) => (
                      <PontoClinico key={indice} texto={texto} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
          );
        })}
      </div>
    </div>
  );
}
