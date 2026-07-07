export type TipoPostIt = "info" | "clinico" | "curiosidade";

export type PostItItem = { tipo: TipoPostIt; texto: string };
export type LinhaTabela = { componente: string; caracteristica: string };
export type TabelaConteudo = { titulo?: string; linhas: LinhaTabela[] };
export type BlocoConteudo = {
  subtitulo: string;
  texto: string;
  tabela?: TabelaConteudo;
  instrucoes?: string[];
};

export type ConteudoPrancha = {
  abertura?: string;
  blocos: BlocoConteudo[];
  postits: PostItItem[];
  palavras_chave: string[];
};

export type ConteudoSistema = {
  abertura?: string;
  postits: PostItItem[];
  fechamento?: { texto: string; postit?: PostItItem };
};

function ehTipoPostIt(valor: unknown): valor is TipoPostIt {
  return valor === "info" || valor === "clinico" || valor === "curiosidade";
}

function normalizarPostIt(valor: unknown): PostItItem | null {
  if (typeof valor !== "object" || valor === null) return null;
  const objeto = valor as Record<string, unknown>;
  if (typeof objeto.texto !== "string") return null;
  return {
    tipo: ehTipoPostIt(objeto.tipo) ? objeto.tipo : "info",
    texto: objeto.texto,
  };
}

function normalizarLinhaTabela(valor: unknown): LinhaTabela | null {
  if (typeof valor !== "object" || valor === null) return null;
  const objeto = valor as Record<string, unknown>;
  if (typeof objeto.componente !== "string" || typeof objeto.caracteristica !== "string") {
    return null;
  }
  return { componente: objeto.componente, caracteristica: objeto.caracteristica };
}

function normalizarTabela(valor: unknown): TabelaConteudo | undefined {
  if (typeof valor !== "object" || valor === null) return undefined;
  const objeto = valor as Record<string, unknown>;
  if (!Array.isArray(objeto.linhas)) return undefined;
  const linhas = objeto.linhas
    .map(normalizarLinhaTabela)
    .filter((l): l is LinhaTabela => l !== null);
  if (linhas.length === 0) return undefined;
  return {
    titulo: typeof objeto.titulo === "string" ? objeto.titulo : undefined,
    linhas,
  };
}

function normalizarBloco(valor: unknown): BlocoConteudo | null {
  if (typeof valor !== "object" || valor === null) return null;
  const objeto = valor as Record<string, unknown>;
  if (typeof objeto.texto !== "string") return null;
  return {
    subtitulo: typeof objeto.subtitulo === "string" ? objeto.subtitulo : "",
    texto: objeto.texto,
    tabela: normalizarTabela(objeto.tabela),
    instrucoes: Array.isArray(objeto.instrucoes)
      ? objeto.instrucoes.filter((i): i is string => typeof i === "string")
      : undefined,
  };
}

export function normalizarConteudoPrancha(json: unknown): ConteudoPrancha {
  if (typeof json !== "object" || json === null) {
    return { blocos: [], postits: [], palavras_chave: [] };
  }
  const objeto = json as Record<string, unknown>;
  return {
    abertura: typeof objeto.abertura === "string" ? objeto.abertura : undefined,
    blocos: Array.isArray(objeto.blocos)
      ? objeto.blocos.map(normalizarBloco).filter((b): b is BlocoConteudo => b !== null)
      : [],
    postits: Array.isArray(objeto.postits)
      ? objeto.postits.map(normalizarPostIt).filter((p): p is PostItItem => p !== null)
      : [],
    palavras_chave: Array.isArray(objeto.palavras_chave)
      ? objeto.palavras_chave.filter((p): p is string => typeof p === "string")
      : [],
  };
}

export function normalizarConteudoSistema(json: unknown): ConteudoSistema {
  if (typeof json !== "object" || json === null) {
    return { postits: [] };
  }
  const objeto = json as Record<string, unknown>;
  const fechamentoBruto = objeto.fechamento;
  let fechamento: ConteudoSistema["fechamento"];
  if (typeof fechamentoBruto === "object" && fechamentoBruto !== null) {
    const fechamentoObjeto = fechamentoBruto as Record<string, unknown>;
    if (typeof fechamentoObjeto.texto === "string") {
      fechamento = {
        texto: fechamentoObjeto.texto,
        postit: normalizarPostIt(fechamentoObjeto.postit) ?? undefined,
      };
    }
  }

  return {
    abertura: typeof objeto.abertura === "string" ? objeto.abertura : undefined,
    postits: Array.isArray(objeto.postits)
      ? objeto.postits.map(normalizarPostIt).filter((p): p is PostItItem => p !== null)
      : [],
    fechamento,
  };
}
