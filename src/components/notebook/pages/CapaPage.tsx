import { HandDivider } from "@/components/notebook/HandDivider";

type CapaPageProps = {
  sistemaNome: string;
  titulo: string;
  numeroPrancha: string;
};

export function CapaPage({ sistemaNome, titulo, numeroPrancha }: CapaPageProps) {
  return (
    <div className="notebook-page flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-sm px-8 py-16 text-center">
      <p className="text-xs tracking-[0.3em] text-gold uppercase">Caderno de Estudo</p>
      <h1 className="font-hand text-5xl font-semibold text-wine sm:text-6xl">
        {sistemaNome}
      </h1>
      <HandDivider className="max-w-xs" />
      <p className="font-hand-note mt-2 text-2xl text-ink-soft">
        {numeroPrancha} — {titulo}
      </p>
      <p className="mt-6 max-w-md font-serif text-lg text-ink-soft italic">
        Vire a página para começar seus estudos: teoria, ilustração para
        colorir e um espaço só seu para anotar.
      </p>
    </div>
  );
}
