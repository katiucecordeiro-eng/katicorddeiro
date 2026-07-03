import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";
import { TipoPostIt } from "@/components/notebook/TipoPostIt";
import { NotebookLines } from "@/components/notebook/NotebookLines";
import { destacarPalavrasChave } from "@/lib/keyword-highlight";
import type { ConteudoPrancha } from "@/components/notebook/theory-types";

type TeoriaPageProps = {
  titulo: string;
  numeroPrancha: string;
  conteudo: ConteudoPrancha;
};

export function TeoriaPage({ titulo, numeroPrancha, conteudo }: TeoriaPageProps) {
  const temConteudo = Boolean(conteudo.abertura) || conteudo.blocos.length > 0;
  const palavras = conteudo.palavras_chave;

  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo={numeroPrancha} titulo={titulo} />

      {temConteudo ? (
        <div className="flex flex-col gap-5">
          {conteudo.abertura && (
            <p className="font-serif text-lg leading-relaxed text-ink italic">
              {destacarPalavrasChave(conteudo.abertura, palavras)}
            </p>
          )}

          {conteudo.blocos.map((bloco, indice) => (
            <div key={indice}>
              {bloco.subtitulo && (
                <h3 className="font-hand mb-1 text-2xl font-semibold text-wine">
                  {bloco.subtitulo}
                </h3>
              )}
              <p className="font-serif text-lg leading-relaxed text-ink">
                {destacarPalavrasChave(bloco.texto, palavras)}
              </p>
            </div>
          ))}

          {conteudo.postits.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {conteudo.postits.map((item, indice) => (
                <TipoPostIt key={indice} item={item} />
              ))}
            </div>
          )}
        </div>
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
        <NotebookLines linhas={6} />
      </div>
    </div>
  );
}
