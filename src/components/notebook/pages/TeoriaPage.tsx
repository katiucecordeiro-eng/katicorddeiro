import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";
import { TipoPostIt } from "@/components/notebook/TipoPostIt";
import { TabelaEstruturas } from "@/components/notebook/TabelaEstruturas";
import { PontoClinico } from "@/components/notebook/PontoClinico";
import { destacarPalavrasChave } from "@/lib/keyword-highlight";
import type { ConteudoPrancha } from "@/components/notebook/theory-types";

type TeoriaPageProps = {
  titulo: string;
  numeroPrancha: string;
  conteudo: ConteudoPrancha;
};

export function TeoriaPage({ titulo, numeroPrancha, conteudo }: TeoriaPageProps) {
  const temConteudo =
    Boolean(conteudo.abertura) || conteudo.blocos.length > 0 || conteudo.tabelas.length > 0;
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
            <div key={indice} className="flex flex-col gap-3">
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

          {conteudo.tabelas.map((tabela, indice) => (
            <TabelaEstruturas key={indice} tabela={tabela} />
          ))}

          {conteudo.instrucao_estudo && (
            <div className="rounded-sm border-l-4 border-gold bg-postit-yellow/30 px-4 py-3">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-gold uppercase">
                ✏️ Instrução de estudo
              </span>
              <p className="text-ink">{conteudo.instrucao_estudo}</p>
            </div>
          )}

          {conteudo.pontos_clinicos.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              {conteudo.pontos_clinicos.map((texto, indice) => (
                <PontoClinico key={indice} texto={texto} />
              ))}
            </div>
          )}

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
          Conteúdo teórico chegando em breve — por enquanto, use as páginas de
          anotação para registrar o que já sabe sobre esta prancha.
        </PostIt>
      )}
    </div>
  );
}
