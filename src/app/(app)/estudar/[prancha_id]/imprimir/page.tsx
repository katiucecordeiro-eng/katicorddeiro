import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CapaPage } from "@/components/notebook/pages/CapaPage";
import { TeoriaPage } from "@/components/notebook/pages/TeoriaPage";
import { IlustracaoPage } from "@/components/notebook/pages/IlustracaoPage";
import { AnotacoesImpressao } from "@/components/notebook/pages/AnotacoesImpressao";
import { NotebookLines } from "@/components/notebook/NotebookLines";
import {
  normalizarConteudoPrancha,
  normalizarConteudoSistema,
} from "@/components/notebook/theory-types";
import { AutoPrint } from "@/components/notebook/AutoPrint";

type PageProps = {
  params: Promise<{ prancha_id: string }>;
};

export const metadata: Metadata = { title: "Imprimir caderno — Asterik" };

export default async function ImprimirPage({ params }: PageProps) {
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

  const { data: progresso } = await supabase
    .from("progresso_usuario")
    .select("anotacoes")
    .eq("user_id", user!.id)
    .eq("prancha_id", prancha_id)
    .maybeSingle();

  const sistemaNome = sistema?.nome ?? "Sistema";
  const conteudoSistema = normalizarConteudoSistema(sistema?.conteudo_teorico);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AutoPrint />
      <p className="no-print text-sm text-ink-soft">
        Preparando a impressão do caderno completo desta prancha…
      </p>

      <div className="print-page-break">
        <CapaPage
          sistemaNome={sistemaNome}
          titulo={prancha.titulo}
          numeroPrancha={prancha.numero_prancha}
          sistemaAbertura={conteudoSistema.abertura}
        />
      </div>

      <div className="print-page-break">
        <TeoriaPage
          titulo={prancha.titulo}
          numeroPrancha={prancha.numero_prancha}
          conteudo={normalizarConteudoPrancha(prancha.conteudo_teorico)}
        />
      </div>

      <div className="print-page-break">
        <IlustracaoPage
          titulo={prancha.titulo}
          numeroPrancha={prancha.numero_prancha}
          imagemBaseUrl={prancha.imagem_base_url}
          legendaCoresJson={prancha.legenda_cores}
        />
        <div className="notebook-page mt-4 rounded-sm px-6 py-6">
          <p className="font-hand-note mb-2 text-lg text-ink-soft">Observações</p>
          <NotebookLines linhas={5} />
        </div>
      </div>

      {(galeria ?? []).map((imagem) => (
        <div key={imagem.id} className="print-page-break">
          <IlustracaoPage
            titulo={imagem.titulo}
            numeroPrancha={prancha.numero_prancha}
            imagemBaseUrl={imagem.imagem_url}
            legendaCoresJson={prancha.legenda_cores}
          />
          <div className="notebook-page mt-4 rounded-sm px-6 py-6">
            <p className="font-hand-note mb-2 text-lg text-ink-soft">Observações</p>
            <NotebookLines linhas={5} />
          </div>
        </div>
      ))}

      <div>
        <AnotacoesImpressao anotacoes={progresso?.anotacoes ?? ""} />
      </div>
    </div>
  );
}
