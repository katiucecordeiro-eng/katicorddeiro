import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quiz — Asterik" };

export default async function QuizPage() {
  const supabase = await createClient();
  const { data: ranking } = await supabase.rpc("ranking");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Quiz</h1>
        <p className="mt-1 text-ink-soft">
          Teste seus conhecimentos sobre cada prancha e suba no ranking.
        </p>
      </div>

      <div className="border-ornamental rounded-sm bg-paper-dark/40 p-6">
        <p className="text-ink-soft">
          Os quizzes por prancha estarão disponíveis em breve. Responda perguntas
          de múltipla escolha sobre as estruturas estudadas para ganhar pontos.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold text-wine">Ranking</h2>
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
              {ranking?.length ? (
                ranking.map((linha) => (
                  <tr key={linha.user_id} className="border-t border-line">
                    <td className="px-4 py-2">{linha.posicao}</td>
                    <td className="px-4 py-2">{linha.nome}</td>
                    <td className="px-4 py-2">{linha.pontos_totais}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-ink-soft">
                    Ninguém pontuou ainda. Seja o primeiro!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
