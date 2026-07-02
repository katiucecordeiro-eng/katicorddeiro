import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha Coleção — Asterik" };

export default async function ColecaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progresso } = await supabase
    .from("progresso_usuario")
    .select("id, completo, atualizado_em, pranchas(id, titulo, numero_prancha)")
    .eq("user_id", user!.id)
    .eq("completo", true)
    .order("atualizado_em", { ascending: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Minha Coleção</h1>
        <p className="mt-1 text-ink-soft">
          Pranchas que você já completou, prontas para exportar como caderneta em PDF.
        </p>
      </div>

      {progresso?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {progresso.map((item) => (
            <div
              key={item.id}
              className="border-ornamental flex flex-col gap-2 rounded-sm bg-paper-dark/30 p-4"
            >
              <p className="text-xs tracking-wide text-gold uppercase">
                {item.pranchas?.numero_prancha}
              </p>
              <p className="font-medium text-ink">{item.pranchas?.titulo}</p>
              <button
                type="button"
                disabled
                title="Exportação em PDF em breve"
                className="mt-2 cursor-not-allowed self-start rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-ink-soft opacity-60"
              >
                Exportar PDF (em breve)
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-6">
          <p className="text-ink-soft">
            Você ainda não completou nenhuma prancha. Continue estudando na
            Biblioteca de Pranchas para começar sua coleção.
          </p>
        </div>
      )}
    </div>
  );
}
