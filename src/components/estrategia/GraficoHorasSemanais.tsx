"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PontoGraficoHoras = {
  dia: string;
  leitura: number;
  colorir: number;
  quiz: number;
  flashcards: number;
  pomodoro: number;
};

const CORES: Record<string, string> = {
  leitura: "#6e2438",
  colorir: "#b3924f",
  quiz: "#4e6073",
  flashcards: "#8a6d9c",
  pomodoro: "#7a9b6f",
};

const ROTULOS: Record<string, string> = {
  leitura: "Leitura",
  colorir: "Colorir",
  quiz: "Quiz",
  flashcards: "Flashcards",
  pomodoro: "Pomodoro",
};

type GraficoHorasSemanaisProps = {
  dados: PontoGraficoHoras[];
  totalSemana: number;
  totalMes: number;
  mediaPorDia: number;
};

function formatarMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  return `${horas}h${resto > 0 ? ` ${resto}min` : ""}`;
}

export function GraficoHorasSemanais({
  dados,
  totalSemana,
  totalMes,
  mediaPorDia,
}: GraficoHorasSemanaisProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Esta semana</p>
          <p className="mt-1 font-serif text-xl font-semibold text-wine">
            {formatarMinutos(totalSemana)}
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Este mês</p>
          <p className="mt-1 font-serif text-xl font-semibold text-slate-dark">
            {formatarMinutos(totalMes)}
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/40 p-4 text-center">
          <p className="text-xs tracking-wide text-ink-soft uppercase">Média por dia</p>
          <p className="mt-1 font-serif text-xl font-semibold text-gold">
            {formatarMinutos(Math.round(mediaPorDia))}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd0b0" />
            <XAxis dataKey="dia" tick={{ fill: "#6b6156", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b6156", fontSize: 12 }} width={36} />
            <Tooltip
              formatter={(valor, nome) => [`${valor}min`, ROTULOS[String(nome)] ?? String(nome)]}
              contentStyle={{
                backgroundColor: "#fbf8f1",
                border: "1px solid #ddd0b0",
                fontSize: 13,
              }}
            />
            <Legend formatter={(valor: string) => ROTULOS[valor] ?? valor} />
            {Object.keys(ROTULOS).map((tipo) => (
              <Bar key={tipo} dataKey={tipo} stackId="horas" fill={CORES[tipo]} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
