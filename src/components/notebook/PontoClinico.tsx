export function PontoClinico({ texto }: { texto: string }) {
  return (
    <div className="rounded-sm border-l-4 border-wine bg-postit-pink/30 px-4 py-3">
      <span className="mb-1 block text-xs font-semibold tracking-wide text-wine uppercase">
        🩺 Ponto clínico
      </span>
      <p className="text-ink">{texto}</p>
    </div>
  );
}
