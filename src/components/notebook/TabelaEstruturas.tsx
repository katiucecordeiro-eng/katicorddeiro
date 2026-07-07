import type { TabelaConteudo } from "@/components/notebook/theory-types";

export function TabelaEstruturas({ tabela }: { tabela: TabelaConteudo }) {
  return (
    <div className="my-1">
      {tabela.titulo && (
        <p className="font-hand-note mb-2 text-lg text-ink-soft">{tabela.titulo}</p>
      )}
      <div className="overflow-hidden rounded-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-dark/60 text-ink-soft uppercase">
            <tr>
              <th className="px-3 py-2">Componente</th>
              <th className="px-3 py-2">Característica</th>
            </tr>
          </thead>
          <tbody>
            {tabela.linhas.map((linha, indice) => (
              <tr key={indice} className="border-t border-line">
                <td className="px-3 py-2 align-top font-medium text-ink">
                  {linha.componente}
                </td>
                <td className="px-3 py-2 align-top text-ink-soft">{linha.caracteristica}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
