import type { TabelaConteudo } from "@/components/notebook/theory-types";

export function TabelaEstruturas({ tabela }: { tabela: TabelaConteudo }) {
  return (
    <div className="my-1">
      {tabela.titulo && (
        <p className="font-hand-note mb-2 text-lg text-ink-soft">{tabela.titulo}</p>
      )}
      <div className="overflow-x-auto rounded-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-dark/60 text-ink-soft uppercase">
            <tr>
              {tabela.colunas.map((coluna, indice) => (
                <th key={indice} className="px-3 py-2 whitespace-nowrap">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.linhas.map((linha, indiceLinha) => (
              <tr key={indiceLinha} className="border-t border-line">
                {linha.map((celula, indiceCelula) => (
                  <td
                    key={indiceCelula}
                    className={`px-3 py-2 align-top ${
                      indiceCelula === 0 ? "font-medium text-ink" : "text-ink-soft"
                    }`}
                  >
                    {celula}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
