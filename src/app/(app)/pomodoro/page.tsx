import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";

export const metadata: Metadata = { title: "Pomodoro — Asterik" };

export default async function PomodoroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessoes } = await supabase
    .from("sessoes_pomodoro")
    .select("id, tipo, duracao_minutos, finalizado_em")
    .eq("user_id", user!.id)
    .not("finalizado_em", "is", null)
    .order("finalizado_em", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Pomodoro</h1>
        <p className="mt-1 text-ink-soft">
          Estruture sua sessão de estudo com ciclos de foco e descanso.
        </p>
      </div>

      <PomodoroTimer />

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold text-wine">
          Sessões recentes
        </h2>
        {sessoes?.length ? (
          <ul className="flex flex-col gap-2">
            {sessoes.map((sessao) => (
              <li
                key={sessao.id}
                className="flex items-center justify-between rounded-sm border border-line px-4 py-2 text-sm"
              >
                <span className="capitalize text-ink">{sessao.tipo}</span>
                <span className="text-ink-soft">{sessao.duracao_minutos} min</span>
                <span className="text-ink-soft">
                  {sessao.finalizado_em &&
                    new Date(sessao.finalizado_em).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">Nenhuma sessão concluída ainda.</p>
        )}
      </section>
    </div>
  );
}
