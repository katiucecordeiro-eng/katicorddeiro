import { paraRomano } from "@/lib/roman";
import { HandDivider } from "@/components/notebook/HandDivider";

type PageHeaderProps = {
  titulo: string;
  numero?: number;
  rotulo?: string;
};

export function PageHeader({ titulo, numero, rotulo }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {(numero !== undefined || rotulo) && (
        <p className="text-xs tracking-[0.25em] text-gold uppercase">
          {rotulo ?? "Página"} {numero !== undefined ? paraRomano(numero) : ""}
        </p>
      )}
      <h1 className="font-hand mt-1 text-4xl font-semibold text-wine sm:text-5xl">
        {titulo}
      </h1>
      <HandDivider className="mt-2 max-w-xs" />
    </header>
  );
}
