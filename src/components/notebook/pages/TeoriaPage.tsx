import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";
import { TipoPostIt } from "@/components/notebook/TipoPostIt";
import { TabelaEstruturas } from "@/components/notebook/TabelaEstruturas";
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
  const postitsClinicos = conteudo.postits.filter((item) => item.tipo === "clinico");
  const postitsRestantes = conteudo.postits.filter((item) => item.tipo !== "clinico");

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

              {bloco.tabela && <TabelaEstruturas tabela={bloco.tabela} />}

              {bloco.instrucoes && bloco.instrucoes.length > 0 && (
                <ol className="font-serif list-decimal space-y-1 pl-5 text-ink">
                  {bloco.instrucoes.map((passo, i) => (
                    <li key={i}>{passo}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}

          {postitsClinicos.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              {postitsClinicos.map((item, indice) => (
                <TipoPostIt key={indice} item={item} />
              ))}
            </div>
          )}

          {postitsRestantes.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {postitsRestantes.map((item, indice) => (
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
