const CLASSES = {
  amarelo: "highlight",
  rosa: "highlight highlight-pink",
  verde: "highlight highlight-green",
} as const;

type HighlightProps = {
  children: React.ReactNode;
  cor?: keyof typeof CLASSES;
};

export function Highlight({ children, cor = "amarelo" }: HighlightProps) {
  return <span className={CLASSES[cor]}>{children}</span>;
}
