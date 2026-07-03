const VALORES: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function paraRomano(numero: number): string {
  let restante = Math.max(1, Math.floor(numero));
  let resultado = "";
  for (const [valor, simbolo] of VALORES) {
    while (restante >= valor) {
      resultado += simbolo;
      restante -= valor;
    }
  }
  return resultado;
}
