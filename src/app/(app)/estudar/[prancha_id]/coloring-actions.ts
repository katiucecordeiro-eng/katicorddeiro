"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { OperacaoPreenchimento } from "@/lib/flood-fill";

export async function salvarCoresPreenchidas(
  pranchaId: string,
  imagemKey: string,
  operacoes: OperacaoPreenchimento[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: atual } = await supabase
    .from("progresso_usuario")
    .select("cores_preenchidas")
    .eq("user_id", user.id)
    .eq("prancha_id", pranchaId)
    .maybeSingle();

  const coresAtuais = (atual?.cores_preenchidas as Record<string, Json>) ?? {};
  const novoValor: Json = { ...coresAtuais, [imagemKey]: operacoes as unknown as Json };

  const { error } = await supabase.from("progresso_usuario").upsert(
    { user_id: user.id, prancha_id: pranchaId, cores_preenchidas: novoValor },
    { onConflict: "user_id,prancha_id" }
  );

  if (error) return { error: "Não foi possível salvar o progresso de cores." };
  return { error: null };
}
