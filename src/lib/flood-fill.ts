export type OperacaoPreenchimento = { x: number; y: number; cor: string };

// Luminância abaixo deste limiar é considerada "linha" (parede) — nunca
// preenchível e nunca ponto de partida válido para o flood-fill.
const LIMIAR_LINHA = 100;

function luminancia(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hexParaRgb(hex: string): { r: number; g: number; b: number } {
  const limpo = hex.replace("#", "");
  const inteiro = parseInt(limpo, 16);
  return {
    r: (inteiro >> 16) & 255,
    g: (inteiro >> 8) & 255,
    b: inteiro & 255,
  };
}

/**
 * Flood-fill iterativo (pilha, 4 direções) sobre os pixels da imagem base.
 * Retorna null se o clique caiu em cima de uma linha (parede) ou fora dos
 * limites — nesse caso não há o que preencher.
 */
export function calcularMascaraPreenchimento(
  imageData: ImageData,
  inicioX: number,
  inicioY: number
): Uint8Array | null {
  const { width, height, data } = imageData;
  const x0 = Math.round(inicioX);
  const y0 = Math.round(inicioY);

  if (x0 < 0 || x0 >= width || y0 < 0 || y0 >= height) return null;

  const inicioIdx = (y0 * width + x0) * 4;
  const luminanciaInicial = luminancia(data[inicioIdx], data[inicioIdx + 1], data[inicioIdx + 2]);
  if (luminanciaInicial < LIMIAR_LINHA) return null;

  const visitados = new Uint8Array(width * height);
  const pilha: number[] = [y0 * width + x0];
  visitados[y0 * width + x0] = 1;

  while (pilha.length > 0) {
    const posicao = pilha.pop()!;
    const x = posicao % width;
    const y = (posicao - x) / width;

    const candidatos: number[] = [];
    if (x + 1 < width) candidatos.push(posicao + 1);
    if (x - 1 >= 0) candidatos.push(posicao - 1);
    if (y + 1 < height) candidatos.push(posicao + width);
    if (y - 1 >= 0) candidatos.push(posicao - width);

    for (const vizinho of candidatos) {
      if (visitados[vizinho]) continue;
      const idx = vizinho * 4;
      const lum = luminancia(data[idx], data[idx + 1], data[idx + 2]);
      if (lum < LIMIAR_LINHA) continue;
      visitados[vizinho] = 1;
      pilha.push(vizinho);
    }
  }

  return visitados;
}

/** Pinta a máscara (com transparência) diretamente no ImageData do overlay. */
export function pintarMascara(
  overlayImageData: ImageData,
  mascara: Uint8Array,
  corHex: string,
  alfa = 190
): void {
  const { r, g, b } = hexParaRgb(corHex);
  const { data } = overlayImageData;

  for (let i = 0; i < mascara.length; i++) {
    if (!mascara[i]) continue;
    const idx = i * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = alfa;
  }
}
