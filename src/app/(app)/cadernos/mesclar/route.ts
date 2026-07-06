import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

const MAX_CADERNOS_POR_MESCLAGEM = 20;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  }

  const corpo = await request.json().catch(() => null);
  const ids = corpo?.ids;

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "Selecione ao menos um caderno." }, { status: 400 });
  }

  const idsLimitados = ids.slice(0, MAX_CADERNOS_POR_MESCLAGEM);

  // A consulta usa o cliente autenticado do próprio usuário: a RLS de
  // "cadernos" garante que só retornam linhas (e portanto pdf_url) que o
  // plano dele realmente permite — mesmo que o cliente peça ids de
  // cadernos exclusivos do Black.
  const { data: cadernos } = await supabase
    .from("cadernos")
    .select("titulo, pdf_url")
    .in("id", idsLimitados);

  const urls = (cadernos ?? [])
    .map((c) => c.pdf_url)
    .filter((url): url is string => Boolean(url));

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "Nenhum dos cadernos selecionados está disponível para download." },
      { status: 400 }
    );
  }

  try {
    const documentoFinal = await PDFDocument.create();

    for (const url of urls) {
      const resposta = await fetch(url);
      if (!resposta.ok) continue;

      const bytes = await resposta.arrayBuffer();
      const documento = await PDFDocument.load(bytes);
      const paginas = await documentoFinal.copyPages(documento, documento.getPageIndices());
      paginas.forEach((pagina) => documentoFinal.addPage(pagina));
    }

    if (documentoFinal.getPageCount() === 0) {
      return NextResponse.json(
        { error: "Não foi possível carregar os PDFs selecionados." },
        { status: 502 }
      );
    }

    const pdfBytes = await documentoFinal.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="asterik-cadernos.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao mesclar os PDFs selecionados." },
      { status: 500 }
    );
  }
}
