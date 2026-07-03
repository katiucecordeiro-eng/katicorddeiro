import { PageHeader } from "@/components/notebook/PageHeader";

export function AnotacoesImpressao({ anotacoes }: { anotacoes: string }) {
  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo="Anotações" titulo="Minhas Anotações" />
      <div className="ruled-lines font-hand-note text-lg whitespace-pre-wrap text-ink" style={{ minHeight: "60vh" }}>
        {anotacoes}
      </div>
    </div>
  );
}
