export type ItemLegendaCor = {
  estrutura?: string;
  cor_sugerida?: string;
};

type PaletaCoresProps = {
  legenda: ItemLegendaCor[];
  corAtual: string;
  onSelecionarCor: (cor: string) => void;
};

const CORES_PADRAO = [
  "#c0392b",
  "#2980b9",
  "#27ae60",
  "#f1c40f",
  "#8e44ad",
  "#d35400",
  "#16a085",
  "#7f8c8d",
];

export function PaletaCores({ legenda, corAtual, onSelecionarCor }: PaletaCoresProps) {
  const coresDaLegenda = legenda
    .map((item) => item.cor_sugerida)
    .filter((cor): cor is string => Boolean(cor));

  const cores = coresDaLegenda.length > 0 ? coresDaLegenda : CORES_PADRAO;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cores.map((cor, indice) => (
        <button
          key={`${cor}-${indice}`}
          type="button"
          onClick={() => onSelecionarCor(cor)}
          title={legenda[indice]?.estrutura ?? cor}
          aria-label={`Selecionar cor ${legenda[indice]?.estrutura ?? cor}`}
          aria-pressed={corAtual === cor}
          className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
            corAtual === cor ? "border-wine" : "border-line"
          }`}
          style={{ backgroundColor: cor }}
        />
      ))}
      <input
        type="color"
        value={corAtual}
        onChange={(evento) => onSelecionarCor(evento.target.value)}
        aria-label="Escolher outra cor"
        className="h-8 w-8 cursor-pointer rounded-full border-2 border-line bg-transparent p-0"
      />
    </div>
  );
}
