type BookCoverProps = {
  capaUrl: string | null;
  titulo: string;
  className?: string;
};

export function BookCover({ capaUrl, titulo, className = "" }: BookCoverProps) {
  if (capaUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={capaUrl}
        alt={`Capa do caderno ${titulo}`}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-wine to-wine-dark p-4 text-center ${className}`}
    >
      <span className="font-hand text-2xl leading-tight text-paper">{titulo}</span>
    </div>
  );
}
