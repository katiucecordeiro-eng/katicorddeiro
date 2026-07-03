const CORES = {
  amarelo: "bg-postit-yellow",
  rosa: "bg-postit-pink",
  azul: "bg-postit-blue",
  verde: "bg-postit-green",
} as const;

export type CorPostIt = keyof typeof CORES;

type PostItProps = {
  children: React.ReactNode;
  cor?: CorPostIt;
  rotacao?: number;
  className?: string;
};

function inclinacaoDeterministica(semente: string): number {
  let hash = 0;
  for (let i = 0; i < semente.length; i++) {
    hash = (hash * 31 + semente.charCodeAt(i)) | 0;
  }
  const sinal = hash % 2 === 0 ? 1 : -1;
  const magnitude = 1 + (Math.abs(hash) % 150) / 100; // entre 1 e 2.5deg
  return sinal * magnitude;
}

export function PostIt({ children, cor = "amarelo", rotacao, className = "" }: PostItProps) {
  const inclinacao = rotacao ?? inclinacaoDeterministica(String(children));

  return (
    <div
      className={`${CORES[cor]} font-hand-note inline-block px-4 py-3 text-base leading-snug text-ink shadow-md ${className}`}
      style={{ transform: `rotate(${inclinacao.toFixed(2)}deg)` }}
    >
      {children}
    </div>
  );
}
