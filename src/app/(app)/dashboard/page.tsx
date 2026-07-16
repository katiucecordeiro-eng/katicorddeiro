import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard — Asterik" };

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
  const hoje = new Date().toISOString().slice(0, 10);
  const flashcardsDevidos = (flashcards ?? []).filter((f) => {
    const proximaRevisao = progressoPorCartao.get(f.id);
    return !proximaRevisao || proximaRevisao <= hoje;
  }).length;

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-5">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Plano atual</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-wine">{planoLabel}</p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-5">
          <p className="text-xs tracking-wide text-ink-soft uppercase">XP acumulado</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-slate-dark">
            {profile?.xp_total ?? 0}
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-5">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Pranchas completas</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-gold">
            {pranchasCompletas ?? 0}
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/pranchas"
          className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
        >
          <h2 className="font-serif text-xl font-semibold text-ink">Biblioteca de Pranchas</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Explore os sistemas anatômicos e continue colorindo suas pranchas.
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
          href="/ranking"
          className="rounded-sm border border-line bg-paper-dark/20 p-5 transition-colors hover:border-wine"
        >
          <h2 className="font-serif text-xl font-semibold text-ink">Ranking</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Veja sua posição entre os estudantes mais dedicados.
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
      </div>
    </div>
  );
}
