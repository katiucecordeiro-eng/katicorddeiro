import { PostIt, type CorPostIt } from "@/components/notebook/PostIt";

export type BlocoTeorico = {
  tipo: "titulo" | "paragrafo" | "post-it" | "destaque";
  texto: string;
  cor?: CorPostIt;
};

function ehBlocoTeorico(valor: unknown): valor is BlocoTeorico {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "tipo" in valor &&
    "texto" in valor &&
    typeof (valor as { texto: unknown }).texto === "string"
  );
}

export function normalizarConteudoTeorico(json: unknown): BlocoTeorico[] {
  if (!Array.isArray(json)) return [];
  return json.filter(ehBlocoTeorico);
}

export function ConteudoTeorico({ blocos }: { blocos: BlocoTeorico[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocos.map((bloco, indice) => {
        switch (bloco.tipo) {
          case "titulo":
            return (
              <h2 key={indice} className="font-hand text-2xl font-semibold text-wine">
                {bloco.texto}
              </h2>
            );
          case "post-it":
            return (
              <PostIt key={indice} cor={bloco.cor ?? "amarelo"}>
                {bloco.texto}
              </PostIt>
            );
          case "destaque":
            return (
              <p key={indice} className="font-serif text-lg leading-relaxed text-ink">
                <span className="highlight">{bloco.texto}</span>
              </p>
            );
          case "paragrafo":
          default:
            return (
              <p key={indice} className="font-serif text-lg leading-relaxed text-ink">
                {bloco.texto}
              </p>
            );
        }
      })}
    </div>
  );
}
