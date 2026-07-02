import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Biblioteca de Pranchas — Asterik" };

export default async function BibliotecaPage() {
  const supabase = await createClient();

  const { data: sistemas } = await supabase
    .from("sistemas")
    .select("id, nome, ordem, pranchas(id, numero_prancha, titulo, disponivel_no_white)")
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
        <h1 className="text-3xl font-semibold text-ink">Biblioteca de Pranchas</h1>
        <p className="mt-1 text-ink-soft">
          Escolha um sistema anatômico para começar a colorir e estudar.
        </p>
      </div>

      {!sistemas?.length && (
        <p className="text-ink-soft">Nenhum sistema cadastrado ainda.</p>
      )}

      <div className="flex flex-col gap-8">
        {sistemas?.map((sistema) => (
          <section key={sistema.id}>
            <h2 className="mb-3 font-serif text-2xl font-semibold text-wine">
              {sistema.nome}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sistema.pranchas?.length ? (
                sistema.pranchas.map((prancha) => {
                  const bloqueada = !acessoTotal && !prancha.disponivel_no_white;
                  return (
                    <div
                      key={prancha.id}
                      className={`rounded-sm border p-4 ${
                        bloqueada
                          ? "border-line bg-paper-dark/10 opacity-60"
                          : "border-line bg-paper-dark/20 hover:border-wine"
                      }`}
                    >
                      <p className="text-xs tracking-wide text-gold uppercase">
                        {prancha.numero_prancha}
                      </p>
                      <p className="mt-1 font-medium text-ink">{prancha.titulo}</p>
                      {bloqueada && (
                        <p className="mt-2 text-xs font-medium text-slate-dark">
                          Disponível no plano Black
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-ink-soft">Nenhuma prancha cadastrada.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
