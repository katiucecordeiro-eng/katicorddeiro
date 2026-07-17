type MiniBarrasSemanaProps = {
  dados: { dia: string; minutos: number }[];
};

export function MiniBarrasSemana({ dados }: MiniBarrasSemanaProps) {
  const maximo = Math.max(1, ...dados.map((d) => d.minutos));

  return (
    <div className="flex h-20 items-end gap-2">
      {dados.map((d, indice) => (
        <div key={indice} className="flex flex-1 flex-col items-center gap-1">
          <div
            title={`${d.minutos}min`}
            className={`w-full rounded-t-sm ${d.minutos > 0 ? "bg-wine/70" : "bg-line"}`}
            style={{ height: `${Math.max(4, (d.minutos / maximo) * 56)}px` }}
          />
          <span className="text-[10px] text-ink-soft">{d.dia}</span>
        </div>
      ))}
    </div>
  );
}
