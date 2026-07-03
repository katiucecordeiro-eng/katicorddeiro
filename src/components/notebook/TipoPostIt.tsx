import { PostIt, type CorPostIt } from "@/components/notebook/PostIt";
import type { PostItItem } from "@/components/notebook/theory-types";

const CONFIG: Record<PostItItem["tipo"], { cor: CorPostIt; rotulo: string }> = {
  info: { cor: "azul", rotulo: "💡 Dica" },
  clinico: { cor: "rosa", rotulo: "🩺 Clínico" },
  curiosidade: { cor: "verde", rotulo: "✨ Curiosidade" },
};

export function TipoPostIt({ item }: { item: PostItItem }) {
  const config = CONFIG[item.tipo] ?? CONFIG.info;
  return (
    <PostIt cor={config.cor}>
      <span className="mb-1 block text-xs font-semibold tracking-wide uppercase opacity-70">
        {config.rotulo}
      </span>
      {item.texto}
    </PostIt>
  );
}
