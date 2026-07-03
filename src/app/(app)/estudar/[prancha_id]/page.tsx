import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotebookViewer } from "@/components/notebook/NotebookViewer";
import { normalizarConteudoTeorico } from "@/components/notebook/ConteudoTeorico";

type PageProps = {
  params: Promise<{ prancha_id: string }>;
};

export const metadata: Metadata = { title: "Estudar — Asterik" };

export default async function EstudarPage({ params }: PageProps) {
  const { prancha_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prancha } = await supabase
    .from("pranchas")
    .select("id, sistema_id, numero_prancha, titulo, imagem_base_url, legenda_cores")
    .eq("id", prancha_id)
    .single();

  if (!prancha) {
    notFound();
  }

  const { data: sistema } = await supabase
    .from("sistemas")
    .select("nome, conteudo_teorico")
    .eq("id", prancha.sistema_id)
    .single();

  const { data: progresso } = await supabase
    .from("progresso_usuario")
    .select("anotacoes")
    .eq("user_id", user!.id)
    .eq("prancha_id", prancha_id)
    .maybeSingle();

  return (
    <NotebookViewer
      pranchaId={prancha.id}
      sistemaNome={sistema?.nome ?? "Sistema"}
      titulo={prancha.titulo}
      numeroPrancha={prancha.numero_prancha}
      imagemBaseUrl={prancha.imagem_base_url}
      legendaCoresJson={prancha.legenda_cores}
      blocosTeoricos={normalizarConteudoTeorico(sistema?.conteudo_teorico)}
      anotacoesIniciais={progresso?.anotacoes ?? ""}
    />
  );
}
