export function calcularStreaks(dias: { cumprido: boolean }[]): {
  atual: number;
  melhor: number;
} {
  let indice = dias.length - 1;
  if (indice >= 0 && !dias[indice].cumprido) indice -= 1;
  let atual = 0;
  for (; indice >= 0; indice--) {
    if (dias[indice].cumprido) atual++;
    else break;
  }

  let melhor = 0;
  let correndo = 0;
  for (const dia of dias) {
    if (dia.cumprido) {
      correndo++;
      melhor = Math.max(melhor, correndo);
    } else {
      correndo = 0;
    }
  }
  return { atual, melhor };
}

export function isoDeData(data: Date): string {
  return data.toISOString().slice(0, 10);
}
