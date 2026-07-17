import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcularStreaks, isoDeData } from "@/lib/habitos";
import { MiniBarrasSemana } from "@/components/dashboard/MiniBarrasSemana";

export const metadata: Metadata = { title: "Dashboard — Asterik" };

const DIAS_STREAK = 70;
const NOMES_DIA_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, plano, xp_total")
    .eq("id", user!.id)
    .single();

  const { count: pranchasCompletas } = await supabase
    .from("progresso_usuario")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("completo", true);

  const { data: flashcards } = await supabase.from("flashcards").select("id");
  const { data: progressoFlashcards } = await supabase
    .from("flashcard_progresso")
    .select("flashcard_id, proxima_revisao")
    .eq("user_id", user!.id);

  const progressoPorCartao = new Map(
    (progressoFlashcards ?? []).map((p) => [p.flashcard_id, p.proxima_revisao])
  );
  const hoje = new Date();
  const hojeISO = isoDeData(hoje);
  const flashcardsDevidos = (flashcards ?? []).filter((f) => {
    const proximaRevisao = progressoPorCartao.get(f.id);
    return !proximaRevisao || proximaRevisao <= hojeISO;
  }).length;

  // Streak
  const inicioStreak = new Date(hoje);
  inicioStreak.setDate(inicioStreak.getDate() - (DIAS_STREAK - 1));
  const { data: habitosRaw } = await supabase
    .from("habitos_dia")
    .select("data, cumprido")
    .eq("user_id", user!.id)
    .gte("data", isoDeData(inicioStreak));
  const habitosPorData = new Map((habitosRaw ?? []).map((h) => [h.data, h.cumprido]));
  const diasStreak = Array.from({ length: DIAS_STREAK }, (_, i) => {
    const data = new Date(inicioStreak);
    data.setDate(data.getDate() + i);
    return { cumprido: Boolean(habitosPorData.get(isoDeData(data))) };
  });
  const { atual: streakAtual, melhor: streakMelhor } = calcularStreaks(diasStreak);

  // Meta semanal + horas da semana
  const { data: estrategia } = await supabase
    .from("estrategia_estudo")
    .select("metas_json")
    .eq("user_id", user!.id)
    .maybeSingle();
  const metasJson = estrategia?.metas_json as { meta_semanal_minutos?: number | null } | null;
  const metaSemanalMinutos = metasJson?.meta_semanal_minutos ?? null;

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(inicioSemana.getDate() - 6);
  const { data: sessoesSemana } = await supabase
    .from("sessoes_estudo")
    .select("minutos, criado_em")
    .eq("user_id", user!.id)
    .gte("criado_em", inicioSemana.toISOString());

  let minutosSemana = 0;
  const minutosPorDia = new Map<string, number>();
  for (const sessao of sessoesSemana ?? []) {
    minutosSemana += sessao.minutos;
    const dataISO = isoDeData(new Date(sessao.criado_em));
    minutosPorDia.set(dataISO, (minutosPorDia.get(dataISO) ?? 0) + sessao.minutos);
  }
  const dadosSemana = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(inicioSemana);
    data.setDate(data.getDate() + i);
    return {
      dia: NOMES_DIA_SEMANA_CURTO[data.getDay()],
      minutos: minutosPorDia.get(isoDeData(data)) ?? 0,
    };
  });
  const progressoMetaSemanal =
    metaSemanalMinutos && metaSemanalMinutos > 0
      ? Math.min(100, Math.round((minutosSemana / metaSemanalMinutos) * 100))
      : null;

  // Continuar de onde parei
  const { data: ultimaPrancha } = await supabase
    .from("progresso_usuario")
    .select("prancha_id, atualizado_em, pranchas(titulo, numero_prancha)")
    .eq("user_id", user!.id)
    .order("atualizado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Ranking
  const { data: ranking } = await supabase.rpc("ranking", {});
  const minhaPosicao = (ranking ?? []).find((linha) => linha.user_id === user!.id);

  const planoLabel = profile?.plano === "black" ? "Black" : "White";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">
          Olá, {profile?.nome || "Estudante"}
        </h1>
        <p className="mt-1 text-ink-soft">
          Bem-vindo(a) de volta ao seu caderno de estudo de anatomia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Sequência</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-wine">🔥 {streakAtual}</p>
          <p className="text-[11px] text-ink-soft">melhor: {streakMelhor}</p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">XP acumulado</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-slate-dark">
            {profile?.xp_total ?? 0}
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Ranking</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-gold">
            {minhaPosicao ? `#${minhaPosicao.posicao}` : "—"}
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Plano</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink">{planoLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="notebook-page rounded-sm p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-hand text-xl font-semibold text-wine">Meta da semana</h2>
            <Link href="/estrategia" className="text-xs text-ink-soft hover:text-wine">
              editar
            </Link>
          </div>
          {progressoMetaSemanal !== null ? (
            <>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-paper-dark">
                <div
                  className="h-full rounded-full bg-wine transition-all"
                  style={{ width: `${progressoMetaSemanal}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                {minutosSemana} de {metaSemanalMinutos} minutos ({progressoMetaSemanal}%)
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">
              Você ainda não definiu uma meta semanal.{" "}
              <Link href="/estrategia" className="text-wine underline">
                Montar minha estratégia
              </Link>
            </p>
          )}
        </div>

        <div className="notebook-page rounded-sm p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-hand text-xl font-semibold text-wine">Horas na semana</h2>
            <Link href="/estrategia" className="text-xs text-ink-soft hover:text-wine">
              ver tudo
            </Link>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{minutosSemana} minutos estudados</p>
          <div className="mt-3">
            <MiniBarrasSemana dados={dadosSemana} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {flashcardsDevidos > 0 && (
          <Link
            href="/flashcards/revisar?modo=devidos"
            className="border-ornamental flex items-center justify-between rounded-sm bg-postit-yellow/40 p-5 transition-colors hover:bg-postit-yellow/60"
          >
            <div>
              <h2 className="font-hand text-2xl font-semibold text-ink">Revisar hoje</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Você tem {flashcardsDevidos}{" "}
                {flashcardsDevidos === 1 ? "flashcard pendente" : "flashcards pendentes"} de
                revisão.
              </p>
            </div>
            <span className="font-hand-note text-3xl text-wine">→</span>
          </Link>
        )}

        {ultimaPrancha && (
          <Link
            href={`/estudar/${ultimaPrancha.prancha_id}`}
            className="border-ornamental flex items-center justify-between rounded-sm bg-postit-blue/40 p-5 transition-colors hover:bg-postit-blue/60"
          >
            <div>
              <h2 className="font-hand text-2xl font-semibold text-ink">
                Continuar de onde parei
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {ultimaPrancha.pranchas?.numero_prancha} · {ultimaPrancha.pranchas?.titulo}
              </p>
            </div>
            <span className="font-hand-note text-3xl text-wine">→</span>
          </Link>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold text-ink-soft">
          Pranchas completas: {pranchasCompletas ?? 0}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/pranchas"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Biblioteca de Pranchas</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Leia o conteúdo descritivo e visualize as ilustrações de cada sistema.
            </p>
          </Link>
          <Link
            href="/quiz"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Quiz</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Teste seus conhecimentos e ganhe XP para subir no ranking.
            </p>
          </Link>
          <Link
            href="/flashcards"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Flashcards</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Revise com o sistema Leitner de repetição espaçada.
            </p>
          </Link>
          <Link
            href="/pomodoro"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Sessão de estudo</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Inicie um ciclo Pomodoro para focar nos estudos de hoje.
            </p>
          </Link>
          <Link
            href="/estrategia"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Minha Estratégia</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Monte sua rotina, acompanhe sua sequência e suas horas de estudo.
            </p>
          </Link>
          <Link
            href="/ranking"
            className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
          >
            <h2 className="font-serif text-xl font-semibold text-ink">Ranking</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Veja sua posição entre os estudantes mais dedicados.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
