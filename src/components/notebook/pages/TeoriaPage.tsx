import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";
import { NotebookLines } from "@/components/notebook/NotebookLines";
import { ConteudoTeorico, type BlocoTeorico } from "@/components/notebook/ConteudoTeorico";

type TeoriaPageProps = {
  sistemaNome: string;
  blocos: BlocoTeorico[];
};

export function TeoriaPage({ sistemaNome, blocos }: TeoriaPageProps) {
  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo="Teoria" titulo={sistemaNome} />

      {blocos.length > 0 ? (
        <ConteudoTeorico blocos={blocos} />
      ) : (
        <PostIt cor="rosa">
          Conteúdo teórico chegando em breve — por enquanto, use o espaço
          abaixo para escrever suas próprias anotações de estudo.
        </PostIt>
      )}

      <div className="mt-8">
        <p className="font-hand-note mb-2 text-lg text-ink-soft">
          Suas anotações nesta página
        </p>
        <NotebookLines linhas={8} />
      </div>
    </div>
  );
}
