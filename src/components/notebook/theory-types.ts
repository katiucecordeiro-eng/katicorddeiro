export type TipoPostIt = "info" | "clinico" | "curiosidade";

export type PostItItem = { tipo: TipoPostIt; texto: string };
export type BlocoConteudo = { subtitulo: string; texto: string };
export type TabelaConteudo = { titulo?: string; colunas: string[]; linhas: string[][] };

export type ConteudoPrancha = {
  abertura?: string;
  blocos: BlocoConteudo[];
  tabelas: TabelaConteudo[];
  pontos_clinicos: string[];
  instrucao_estudo?: string;
  postits: PostItItem[];
  palavras_chave: string[];
};

export type ConteudoSistema = {
  abertura?: string;
  pontos_clinicos: string[];
  postits: PostItItem[];
  fechamento?: { texto: string; pontos_clinicos: string[] };
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

function normalizarPontosClinicos(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === "string");
}

function normalizarTabela(valor: unknown): TabelaConteudo | null {
  if (typeof valor !== "object" || valor === null) return null;
  const objeto = valor as Record<string, unknown>;
  if (!Array.isArray(objeto.colunas) || !Array.isArray(objeto.linhas)) return null;

  const colunas = objeto.colunas.filter((c): c is string => typeof c === "string");
  const linhas = objeto.linhas
    .filter((linha): linha is unknown[] => Array.isArray(linha))
    .map((linha) => linha.map((celula) => (typeof celula === "string" ? celula : String(celula))));

  if (!colunas.length || !linhas.length) return null;

  return {
    titulo: typeof objeto.titulo === "string" ? objeto.titulo : undefined,
    colunas,
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
  };
}

export function normalizarConteudoPrancha(json: unknown): ConteudoPrancha {
  if (typeof json !== "object" || json === null) {
    return { blocos: [], tabelas: [], pontos_clinicos: [], postits: [], palavras_chave: [] };
  }
  const objeto = json as Record<string, unknown>;
  return {
    abertura: typeof objeto.abertura === "string" ? objeto.abertura : undefined,
    blocos: Array.isArray(objeto.blocos)
      ? objeto.blocos.map(normalizarBloco).filter((b): b is BlocoConteudo => b !== null)
      : [],
    tabelas: Array.isArray(objeto.tabelas)
      ? objeto.tabelas.map(normalizarTabela).filter((t): t is TabelaConteudo => t !== null)
      : [],
    pontos_clinicos: normalizarPontosClinicos(objeto.pontos_clinicos),
    instrucao_estudo:
      typeof objeto.instrucao_estudo === "string" ? objeto.instrucao_estudo : undefined,
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
    return { pontos_clinicos: [], postits: [] };
  }
  const objeto = json as Record<string, unknown>;
  const fechamentoBruto = objeto.fechamento;
  let fechamento: ConteudoSistema["fechamento"];
  if (typeof fechamentoBruto === "object" && fechamentoBruto !== null) {
    const fechamentoObjeto = fechamentoBruto as Record<string, unknown>;
    if (typeof fechamentoObjeto.texto === "string") {
      fechamento = {
        texto: fechamentoObjeto.texto,
        pontos_clinicos: normalizarPontosClinicos(fechamentoObjeto.pontos_clinicos),
      };
    }
  }

  return {
    abertura: typeof objeto.abertura === "string" ? objeto.abertura : undefined,
    pontos_clinicos: normalizarPontosClinicos(objeto.pontos_clinicos),
    postits: Array.isArray(objeto.postits)
      ? objeto.postits.map(normalizarPostIt).filter((p): p is PostItItem => p !== null)
      : [],
    fechamento,
  };
}
