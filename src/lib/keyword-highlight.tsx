import { Fragment, type ReactNode } from "react";
import { Highlight } from "@/components/notebook/Highlight";

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function destacarPalavrasChave(texto: string, palavras: string[]): ReactNode {
  if (!palavras.length) return texto;

  const padrao = palavras
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escaparRegex)
    .join("|");
  const regex = new RegExp(`(${padrao})`, "gi");
  const partes = texto.split(regex);

  return partes.map((parte, indice) => {
    const ehPalavraChave = palavras.some(
      (palavra) => palavra.toLowerCase() === parte.toLowerCase()
    );
    return ehPalavraChave ? (
      <Highlight key={indice}>{parte}</Highlight>
    ) : (
      <Fragment key={indice}>{parte}</Fragment>
    );
  });
}
