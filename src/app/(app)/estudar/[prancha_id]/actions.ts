"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function salvarAnotacoes(prancha_id: string, anotacoes: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase.from("progresso_usuario").upsert(
    {
      user_id: user.id,
      prancha_id,
      anotacoes,
    },
    { onConflict: "user_id,prancha_id" }
  );

  if (error) return { error: "Não foi possível salvar as anotações." };

  revalidatePath(`/estudar/${prancha_id}`);
  return { error: null };
}
