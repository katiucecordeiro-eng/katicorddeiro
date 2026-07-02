"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PerfilState = { error: string | null; sucesso?: boolean };

export async function atualizarNome(
  _prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) {
    return { error: "O nome não pode ficar em branco." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nome })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível atualizar o nome." };
  }

  revalidatePath("/perfil");
  return { error: null, sucesso: true };
}
