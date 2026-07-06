import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EstanteCadernos } from "@/components/cadernos/EstanteCadernos";

export const metadata: Metadata = { title: "Cadernos para Imprimir — Asterik" };

export default async function CadernosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plano")
    .eq("id", user!.id)
    .single();

  const { data: cadernos } = await supabase.rpc("cadernos_catalogo");

  const acessoTotal = profile?.plano === "black";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">
          Cadernos para Imprimir
        </h1>
        <p className="mt-1 text-ink-soft">
          Cadernos ilustrados prontos para imprimir, colorir e colecionar.
          Selecione vários para baixar tudo de uma vez.
        </p>
      </div>

      {cadernos?.length ? (
        <EstanteCadernos cadernos={cadernos} acessoTotal={acessoTotal} />
      ) : (
        <p className="text-ink-soft">Nenhum caderno disponível ainda.</p>
      )}
    </div>
  );
}
