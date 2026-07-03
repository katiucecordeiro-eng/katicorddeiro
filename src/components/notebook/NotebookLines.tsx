type NotebookLinesProps = {
  linhas?: number;
  className?: string;
};

export function NotebookLines({ linhas = 8, className = "" }: NotebookLinesProps) {
  return (
    <div
      className={`ruled-lines ${className}`}
      style={{ minHeight: `${linhas * 32}px` }}
      aria-hidden="true"
    />
  );
}
