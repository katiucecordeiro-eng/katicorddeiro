"use client";

export type Rotulo = {
  id: string;
  texto: string;
  pos_x: number;
  pos_y: number;
};

type RotulosOverlayProps = {
  rotulos: Rotulo[];
  mostrarNomes: boolean;
  revelados: Set<string>;
  onTocarRotulo: (id: string) => void;
};

export function RotulosOverlay({
  rotulos,
  mostrarNomes,
  revelados,
  onTocarRotulo,
}: RotulosOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {rotulos.map((rotulo, indice) => {
        const revelado = mostrarNomes || revelados.has(rotulo.id);
        return (
          <button
            key={rotulo.id}
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              onTocarRotulo(rotulo.id);
            }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${rotulo.pos_x * 100}%`, top: `${rotulo.pos_y * 100}%` }}
            aria-label={revelado ? rotulo.texto : `Estrutura ${indice + 1} (oculta, toque para revelar)`}
          >
            {revelado ? (
              <span className="font-hand-note inline-block rounded-full border border-wine bg-paper/95 px-2.5 py-1 text-xs whitespace-nowrap text-ink shadow-md">
                {rotulo.texto}
              </span>
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-wine bg-paper/95 text-xs font-semibold text-wine shadow-md">
                {indice + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
