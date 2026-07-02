import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EditarNomeForm } from "@/components/perfil/EditarNomeForm";

export const metadata: Metadata = { title: "Perfil — Asterik" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, plano, xp_total, criado_em")
    .eq("id", user!.id)
    .single();

  const planoLabel = profile?.plano === "black" ? "Black" : "White";
  const membroDesde = profile?.criado_em
    ? new Date(profile.criado_em).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Perfil</h1>
        <p className="mt-1 text-ink-soft">Suas informações de conta.</p>
      </div>

      <div className="border-ornamental flex flex-col gap-6 rounded-sm bg-paper-dark/40 p-6">
        <EditarNomeForm nomeAtual={profile?.nome ?? ""} />

        <dl className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-ink-soft uppercase">E-mail</dt>
            <dd className="mt-1 text-ink">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-soft uppercase">Plano</dt>
            <dd className="mt-1 font-medium text-wine">{planoLabel}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-soft uppercase">XP total</dt>
            <dd className="mt-1 text-ink">{profile?.xp_total ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-soft uppercase">Membro desde</dt>
            <dd className="mt-1 text-ink">{membroDesde}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
