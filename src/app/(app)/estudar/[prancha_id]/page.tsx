import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotebookViewer } from "@/components/notebook/NotebookViewer";
import {
  normalizarConteudoPrancha,
  normalizarConteudoSistema,
} from "@/components/notebook/theory-types";

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
    .select(
      "id, sistema_id, numero_prancha, titulo, imagem_base_url, legenda_cores, conteudo_teorico"
    )
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

  const { data: galeria } = await supabase
    .from("prancha_imagens")
    .select("id, imagem_url, titulo, ordem")
    .eq("prancha_id", prancha_id)
    .order("ordem");

  const { data: rotulos } = await supabase
    .from("prancha_rotulos")
    .select("id, prancha_imagem_id, texto, pos_x, pos_y, ordem")
    .eq("prancha_id", prancha_id)
    .order("ordem");

  const { data: progresso } = await supabase
    .from("progresso_usuario")
    .select("anotacoes, cores_preenchidas")
    .eq("user_id", user!.id)
    .eq("prancha_id", prancha_id)
    .maybeSingle();

  const conteudoSistema = normalizarConteudoSistema(sistema?.conteudo_teorico);

  return (
    <NotebookViewer
      pranchaId={prancha.id}
      sistemaNome={sistema?.nome ?? "Sistema"}
      sistemaAbertura={conteudoSistema.abertura}
      titulo={prancha.titulo}
      numeroPrancha={prancha.numero_prancha}
      imagemBaseUrl={prancha.imagem_base_url}
      legendaCoresJson={prancha.legenda_cores}
      conteudoPrancha={normalizarConteudoPrancha(prancha.conteudo_teorico)}
      galeria={galeria ?? []}
      rotulos={rotulos ?? []}
      progressoCoresJson={progresso?.cores_preenchidas ?? {}}
      anotacoesIniciais={progresso?.anotacoes ?? ""}
    />
  );
}
