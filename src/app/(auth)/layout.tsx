export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-serif text-4xl font-semibold tracking-wide text-wine">
            Asterik
          </span>
          <p className="mt-2 text-sm tracking-wide text-ink-soft uppercase">
            Caderno de Estudo de Anatomia
          </p>
        </div>
        <div className="border-ornamental rounded-sm bg-paper-dark/60 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
