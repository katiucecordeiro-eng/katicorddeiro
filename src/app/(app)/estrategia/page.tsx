import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EstrategiaForm } from "@/components/estrategia/EstrategiaForm";
import { HabitoTracker, type HabitoDia } from "@/components/estrategia/HabitoTracker";
import {
  GraficoHorasSemanais,
  type PontoGraficoHoras,
} from "@/components/estrategia/GraficoHorasSemanais";
import { RegistroManualTempo } from "@/components/estrategia/RegistroManualTempo";
import type { FormatoRotina, MetasEstudo } from "@/lib/actions/estudo";
import { isoDeData } from "@/lib/habitos";

export const metadata: Metadata = { title: "Minha Estratégia — Asterik" };

const DIAS_GRADE_HABITOS = 70;
const DIAS_GRAFICO = 34;
const NOMES_DIA_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function EstrategiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sistemas } = await supabase.from("sistemas").select("slug, nome").order("ordem");

  const { data: estrategia } = await supabase
    .from("estrategia_estudo")
    .select("formatos_json, metas_json")
    .eq("user_id", user!.id)
    .maybeSingle();

  const formatosIniciais = (estrategia?.formatos_json as FormatoRotina[] | null) ?? [];
  const metasJson = estrategia?.metas_json as
    | { meta_diaria_minutos?: number | null; meta_semanal_minutos?: number | null; sistemas_foco?: string[] }
    | null;
  const metasIniciais: MetasEstudo = {
    metaDiariaMinutos: metasJson?.meta_diaria_minutos ?? null,
    metaSemanalMinutos: metasJson?.meta_semanal_minutos ?? null,
    sistemasFoco: metasJson?.sistemas_foco ?? [],
  };

  const hoje = new Date();
  const inicioGradeHabitos = new Date(hoje);
  inicioGradeHabitos.setDate(inicioGradeHabitos.getDate() - (DIAS_GRADE_HABITOS - 1));

  const { data: habitosRaw } = await supabase
    .from("habitos_dia")
    .select("data, cumprido, minutos_estudados")
    .eq("user_id", user!.id)
    .gte("data", isoDeData(inicioGradeHabitos));

  const habitos: HabitoDia[] = habitosRaw ?? [];
  const jaMarcadoHoje = Boolean(habitos.find((h) => h.data === isoDeData(hoje))?.cumprido);

  const inicioGrafico = new Date(hoje);
  inicioGrafico.setDate(inicioGrafico.getDate() - (DIAS_GRAFICO - 1));
  const { data: sessoes } = await supabase
    .from("sessoes_estudo")
    .select("tipo, minutos, criado_em")
    .eq("user_id", user!.id)
    .gte("criado_em", inicioGrafico.toISOString());

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(inicioSemana.getDate() - 6);
  let totalSemana = 0;
  let totalMes = 0;
  for (const sessao of sessoes ?? []) {
    totalMes += sessao.minutos;
    if (new Date(sessao.criado_em) >= inicioSemana) totalSemana += sessao.minutos;
  }
  const mediaPorDia = totalMes / DIAS_GRAFICO;

  const dadosGrafico: PontoGraficoHoras[] = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    const dataISO = isoDeData(data);
    const ponto: PontoGraficoHoras = {
      dia: NOMES_DIA_SEMANA_CURTO[data.getDay()],
      leitura: 0,
      colorir: 0,
      quiz: 0,
      flashcards: 0,
      pomodoro: 0,
    };
    for (const sessao of sessoes ?? []) {
      if (isoDeData(new Date(sessao.criado_em)) === dataISO) {
        ponto[sessao.tipo as keyof Omit<PontoGraficoHoras, "dia">] += sessao.minutos;
      }
    }
    dadosGrafico.push(ponto);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <div>
        <h1 className="font-hand text-4xl font-semibold text-ink">Minha Estratégia de Estudo</h1>
        <p className="mt-1 text-ink-soft">
          Monte sua rotina, acompanhe sua sequência de dias e veja quanto tempo você tem
          dedicado aos estudos.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold text-wine">Sua rotina</h2>
        <EstrategiaForm
          formatosIniciais={formatosIniciais}
          metasIniciais={metasIniciais}
          sistemas={sistemas ?? []}
        />
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold text-wine">Sequência de estudos</h2>
        <HabitoTracker
          habitos={habitos}
          diasGrade={DIAS_GRADE_HABITOS}
          jaMarcadoHoje={jaMarcadoHoje}
        />
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl font-semibold text-wine">Horas estudadas</h2>
        <div className="flex flex-col gap-4">
          <GraficoHorasSemanais
            dados={dadosGrafico}
            totalSemana={totalSemana}
            totalMes={totalMes}
            mediaPorDia={mediaPorDia}
          />
          <RegistroManualTempo />
        </div>
      </section>
    </div>
  );
}
