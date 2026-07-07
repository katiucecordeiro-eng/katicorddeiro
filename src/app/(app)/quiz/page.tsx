import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HandDivider } from "@/components/notebook/HandDivider";
import type { Database } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Quiz — Asterik" };

type Dificuldade = Database["public"]["Enums"]["dificuldade_quiz"];
const DIFICULDADES: { valor: Dificuldade; rotulo: string }[] = [
  { valor: "facil", rotulo: "Fácil" },
  { valor: "medio", rotulo: "Médio" },
  { valor: "dificil", rotulo: "Difícil" },
];

export default async function QuizPage() {
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

  const { data: perguntas } = await supabase.from("quiz_perguntas").select("prancha_id, dificuldade");

  const contagem = new Map<string, number>();
  for (const p of perguntas ?? []) {
    const chave = `${p.prancha_id}:${p.dificuldade}`;
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }

  function contarPorSistema(pranchaIds: string[], dificuldade: Dificuldade) {
    return pranchaIds.reduce(
      (total, id) => total + (contagem.get(`${id}:${dificuldade}`) ?? 0),
      0
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">Quiz</h1>
        <p className="mt-1 text-ink-soft">
          Escolha um sistema, uma prancha (opcional) e a dificuldade para testar seus
          conhecimentos.
        </p>
      </div>

      {!sistemas?.length && <p className="text-ink-soft">Nenhum sistema cadastrado ainda.</p>}

      <div className="flex flex-col gap-10">
        {sistemas?.map((sistema) => {
          const pranchaIdsAcessiveis = (sistema.pranchas ?? [])
            .filter((p) => acessoTotal || p.disponivel_no_white)
            .map((p) => p.id);

          const temQuizNoSistema = DIFICULDADES.some(
            ({ valor }) => contarPorSistema(pranchaIdsAcessiveis, valor) > 0
          );

          return (
            <section key={sistema.id}>
              <h2 className="font-hand text-3xl font-semibold text-wine">{sistema.nome}</h2>
              <HandDivider className="mb-4 max-w-[10rem]" />

              {temQuizNoSistema && (
                <div className="mb-5">
                  <p className="font-hand-note mb-2 text-sm text-ink-soft">
                    Quiz do sistema inteiro
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DIFICULDADES.map(({ valor, rotulo }) => {
                      const total = contarPorSistema(pranchaIdsAcessiveis, valor);
                      return total > 0 ? (
                        <Link
                          key={valor}
                          href={`/quiz/jogar?sistema_id=${sistema.id}&dificuldade=${valor}`}
                          className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
                        >
                          {rotulo} ({total})
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sistema.pranchas?.length ? (
                  sistema.pranchas.map((prancha) => {
                    const bloqueada = !acessoTotal && !prancha.disponivel_no_white;
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
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {DIFICULDADES.map(({ valor, rotulo }) => {
                              const total = contagem.get(`${prancha.id}:${valor}`) ?? 0;
                              return total > 0 ? (
                                <Link
                                  key={valor}
                                  href={`/quiz/jogar?prancha_id=${prancha.id}&dificuldade=${valor}`}
                                  className="rounded-sm bg-paper-dark/60 px-2 py-1 text-xs text-ink-soft hover:bg-wine hover:text-paper"
                                >
                                  {rotulo}
                                </Link>
                              ) : null;
                            })}
                          </div>
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
