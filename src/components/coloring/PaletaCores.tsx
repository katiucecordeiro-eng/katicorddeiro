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
  const itensDaLegenda = legenda.filter(
    (item): item is ItemLegendaCor & { cor_sugerida: string } => Boolean(item.cor_sugerida)
  );

  if (itensDaLegenda.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {CORES_PADRAO.map((cor) => (
          <button
            key={cor}
            type="button"
            onClick={() => onSelecionarCor(cor)}
            aria-label={`Selecionar cor ${cor}`}
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

  return (
    <div className="flex flex-col gap-2">
      <p className="font-hand-note text-sm text-ink-soft">Guia de cores para pintura</p>
      <div className="flex flex-wrap gap-2">
        {itensDaLegenda.map((item, indice) => (
          <button
            key={`${item.cor_sugerida}-${indice}`}
            type="button"
            onClick={() => onSelecionarCor(item.cor_sugerida)}
            aria-pressed={corAtual === item.cor_sugerida}
            className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-sm text-ink transition-colors ${
              corAtual === item.cor_sugerida
                ? "border-wine bg-postit-yellow/30"
                : "border-line hover:border-wine"
            }`}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-line"
              style={{ backgroundColor: item.cor_sugerida }}
            />
            {item.estrutura ?? item.cor_sugerida}
          </button>
        ))}
        <input
          type="color"
          value={corAtual}
          onChange={(evento) => onSelecionarCor(evento.target.value)}
          aria-label="Escolher outra cor"
          className="h-9 w-9 cursor-pointer rounded-full border-2 border-line bg-transparent p-0"
        />
      </div>
    </div>
  );
}
