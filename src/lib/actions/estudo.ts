"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type FormatoEstudo = Database["public"]["Enums"]["formato_estudo"];

export type FormatoRotina = { tipo: FormatoEstudo; minutos: number };
export type MetasEstudo = {
  metaDiariaMinutos: number | null;
  metaSemanalMinutos: number | null;
  sistemasFoco: string[];
};

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function salvarEstrategia(
  formatos: FormatoRotina[],
  metas: MetasEstudo
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase.from("estrategia_estudo").upsert(
    {
      user_id: user.id,
      formatos_json: formatos,
      metas_json: {
        meta_diaria_minutos: metas.metaDiariaMinutos,
        meta_semanal_minutos: metas.metaSemanalMinutos,
        sistemas_foco: metas.sistemasFoco,
      },
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "Não foi possível salvar sua estratégia de estudo." };

  revalidatePath("/estrategia");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function registrarTempoEstudo(
  tipo: FormatoEstudo,
  minutos: number
): Promise<{ error: string | null }> {
  if (minutos <= 0) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error: erroSessao } = await supabase.from("sessoes_estudo").insert({
    user_id: user.id,
    tipo,
    minutos,
  });
  if (erroSessao) return { error: "Não foi possível registrar o tempo de estudo." };

  const hoje = hojeISO();
  const { data: habitoAtual } = await supabase
    .from("habitos_dia")
    .select("minutos_estudados, formatos_usados_json, cumprido")
    .eq("user_id", user.id)
    .eq("data", hoje)
    .maybeSingle();

  const { data: estrategia } = await supabase
    .from("estrategia_estudo")
    .select("metas_json")
    .eq("user_id", user.id)
    .maybeSingle();

  const metasJson = estrategia?.metas_json as { meta_diaria_minutos?: number | null } | null;
  const metaDiaria = metasJson?.meta_diaria_minutos ?? null;

  const formatosAnteriores = Array.isArray(habitoAtual?.formatos_usados_json)
    ? (habitoAtual!.formatos_usados_json as string[])
    : [];
  const novosFormatos = formatosAnteriores.includes(tipo)
    ? formatosAnteriores
    : [...formatosAnteriores, tipo];
  const minutosTotais = (habitoAtual?.minutos_estudados ?? 0) + minutos;
  const cumprido =
    habitoAtual?.cumprido || (metaDiaria !== null && minutosTotais >= metaDiaria);

  const { error: erroHabito } = await supabase.from("habitos_dia").upsert(
    {
      user_id: user.id,
      data: hoje,
      minutos_estudados: minutosTotais,
      formatos_usados_json: novosFormatos,
      cumprido,
    },
    { onConflict: "user_id,data" }
  );
  if (erroHabito) return { error: "Não foi possível atualizar seu hábito de hoje." };

  revalidatePath("/dashboard");
  revalidatePath("/estrategia");
  return { error: null };
}

export async function marcarHabitoManual(
  cumprido: boolean,
  formato: FormatoEstudo = "colorir"
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const hoje = hojeISO();
  const { data: habitoAtual } = await supabase
    .from("habitos_dia")
    .select("formatos_usados_json")
    .eq("user_id", user.id)
    .eq("data", hoje)
    .maybeSingle();

  const formatosAnteriores = Array.isArray(habitoAtual?.formatos_usados_json)
    ? (habitoAtual!.formatos_usados_json as string[])
    : [];
  const novosFormatos =
    cumprido && !formatosAnteriores.includes(formato)
      ? [...formatosAnteriores, formato]
      : formatosAnteriores;

  const { error } = await supabase.from("habitos_dia").upsert(
    {
      user_id: user.id,
      data: hoje,
      cumprido,
      formatos_usados_json: novosFormatos,
    },
    { onConflict: "user_id,data" }
  );

  if (error) return { error: "Não foi possível marcar o hábito de hoje." };

  revalidatePath("/dashboard");
  revalidatePath("/estrategia");
  return { error: null };
}
