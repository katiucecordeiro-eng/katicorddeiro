import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";

type LegendaCor = {
  estrutura?: string;
  cor_sugerida?: string;
  area_id?: string;
};

function normalizarLegenda(json: unknown): LegendaCor[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (item): item is LegendaCor => typeof item === "object" && item !== null
  );
}

type IlustracaoPageProps = {
  titulo: string;
  numeroPrancha: string;
  imagemBaseUrl: string | null;
  legendaCoresJson: unknown;
};

export function IlustracaoPage({
  titulo,
  numeroPrancha,
  imagemBaseUrl,
  legendaCoresJson,
}: IlustracaoPageProps) {
  const legenda = normalizarLegenda(legendaCoresJson);

  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo={numeroPrancha} titulo={titulo} />

      {imagemBaseUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagemBaseUrl}
          alt={`Ilustração para colorir no papel: ${titulo}`}
          className="mx-auto max-h-[55vh] w-auto"
        />
      ) : (
        <PostIt cor="azul">A ilustração desta prancha ainda não foi adicionada.</PostIt>
      )}

      {legenda.length > 0 && (
        <div className="mt-6">
          <p className="font-hand-note mb-2 text-lg text-ink-soft">Legenda de cores</p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {legenda.map((item, indice) => (
              <li key={indice} className="flex items-center gap-2 text-sm text-ink">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-line"
                  style={{ backgroundColor: item.cor_sugerida || "transparent" }}
                />
                {item.estrutura}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
