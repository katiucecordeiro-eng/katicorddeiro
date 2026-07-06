"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PageHeader } from "@/components/notebook/PageHeader";
import { ColoringCanvas, type ColoringCanvasHandle } from "@/components/coloring/ColoringCanvas";
import { PaletaCores, type ItemLegendaCor } from "@/components/coloring/PaletaCores";
import type { OperacaoPreenchimento } from "@/lib/flood-fill";
import { salvarCoresPreenchidas } from "@/app/(app)/estudar/[prancha_id]/coloring-actions";

type ImagemColorivel = {
  chave: string;
  url: string;
  titulo: string;
};

type IlustracaoColorivelProps = {
  pranchaId: string;
  titulo: string;
  numeroPrancha: string;
  imagemPrincipalUrl: string | null;
  legendaCoresJson: unknown;
  galeria: { id: string; imagem_url: string; titulo: string }[];
  progressoInicialJson: unknown;
};

function normalizarLegenda(json: unknown): ItemLegendaCor[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (item): item is ItemLegendaCor => typeof item === "object" && item !== null
  );
}

function normalizarProgresso(json: unknown): Record<string, OperacaoPreenchimento[]> {
  if (typeof json !== "object" || json === null) return {};
  const objeto = json as Record<string, unknown>;
  const resultado: Record<string, OperacaoPreenchimento[]> = {};
  for (const [chave, valor] of Object.entries(objeto)) {
    if (Array.isArray(valor)) {
      resultado[chave] = valor.filter(
        (op): op is OperacaoPreenchimento =>
          typeof op === "object" &&
          op !== null &&
          typeof (op as OperacaoPreenchimento).x === "number" &&
          typeof (op as OperacaoPreenchimento).y === "number" &&
          typeof (op as OperacaoPreenchimento).cor === "string"
      );
    }
  }
  return resultado;
}

function imprimirImagem(src: string) {
  const janela = window.open("", "_blank");
  if (!janela) return;
  janela.document.write(
    `<html><head><title>Imprimir</title></head><body style="margin:0">` +
      `<img src="${src}" style="width:100%" onload="window.print()" />` +
      `</body></html>`
  );
  janela.document.close();
}

export function IlustracaoColorivel({
  pranchaId,
  titulo,
  numeroPrancha,
  imagemPrincipalUrl,
  legendaCoresJson,
  galeria,
  progressoInicialJson,
}: IlustracaoColorivelProps) {
  const imagens: ImagemColorivel[] = useMemo(() => {
    const lista: ImagemColorivel[] = [];
    if (imagemPrincipalUrl) {
      lista.push({ chave: "principal", url: imagemPrincipalUrl, titulo: "Visão Geral" });
    }
    for (const item of galeria) {
      lista.push({ chave: item.id, url: item.imagem_url, titulo: item.titulo });
    }
    return lista;
  }, [imagemPrincipalUrl, galeria]);

  const legenda = useMemo(() => normalizarLegenda(legendaCoresJson), [legendaCoresJson]);
  const progressoInicial = useMemo(
    () => normalizarProgresso(progressoInicialJson),
    [progressoInicialJson]
  );

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [operacoesPorImagem, setOperacoesPorImagem] =
    useState<Record<string, OperacaoPreenchimento[]>>(progressoInicial);
  const [corAtual, setCorAtual] = useState(legenda[0]?.cor_sugerida ?? "#c0392b");
  const [, startTransition] = useTransition();
  const canvasRef = useRef<ColoringCanvasHandle>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imagemAtual = imagens[indiceAtual];
  const operacoesAtuais = (imagemAtual && operacoesPorImagem[imagemAtual.chave]) || [];

  useEffect(() => {
    return () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    };
  }, []);

  function agendarSalvamento(chave: string, operacoes: OperacaoPreenchimento[]) {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    temporizadorRef.current = setTimeout(() => {
      startTransition(async () => {
        await salvarCoresPreenchidas(pranchaId, chave, operacoes);
      });
    }, 700);
  }

  function atualizarOperacoes(chave: string, operacoes: OperacaoPreenchimento[]) {
    setOperacoesPorImagem((atual) => ({ ...atual, [chave]: operacoes }));
    agendarSalvamento(chave, operacoes);
  }

  function aoNovaOperacao(operacao: OperacaoPreenchimento) {
    if (!imagemAtual) return;
    atualizarOperacoes(imagemAtual.chave, [...operacoesAtuais, operacao]);
  }

  function desfazer() {
    if (!imagemAtual || operacoesAtuais.length === 0) return;
    atualizarOperacoes(imagemAtual.chave, operacoesAtuais.slice(0, -1));
  }

  function limparTudo() {
    if (!imagemAtual) return;
    atualizarOperacoes(imagemAtual.chave, []);
  }

  if (imagens.length === 0) {
    return (
      <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
        <PageHeader rotulo={numeroPrancha} titulo={titulo} />
        <p className="font-hand-note text-ink-soft">
          A ilustração desta prancha ainda não foi adicionada.
        </p>
      </div>
    );
  }

  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
      <PageHeader rotulo={numeroPrancha} titulo={titulo} />

      {imagens.length > 1 && (
        <div className="no-print mb-4 flex flex-wrap gap-2">
          {imagens.map((imagem, indice) => (
            <button
              key={imagem.chave}
              type="button"
              onClick={() => setIndiceAtual(indice)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                indice === indiceAtual
                  ? "bg-wine text-paper"
                  : "border border-line text-ink-soft hover:border-wine hover:text-wine"
              }`}
            >
              {imagem.titulo}
            </button>
          ))}
        </div>
      )}

      <ColoringCanvas
        ref={canvasRef}
        imagemUrl={imagemAtual.url}
        corAtual={corAtual}
        operacoes={operacoesAtuais}
        onNovaOperacao={aoNovaOperacao}
      />

      <div className="no-print mt-4 flex flex-col gap-4">
        <PaletaCores legenda={legenda} corAtual={corAtual} onSelecionarCor={setCorAtual} />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={desfazer}
            disabled={operacoesAtuais.length === 0}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine disabled:opacity-40"
          >
            Desfazer
          </button>
          <button
            type="button"
            onClick={limparTudo}
            disabled={operacoesAtuais.length === 0}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine disabled:opacity-40"
          >
            Limpar tudo
          </button>
          <button
            type="button"
            onClick={() => imprimirImagem(imagemAtual.url)}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
          >
            Imprimir em branco
          </button>
          <button
            type="button"
            onClick={() => {
              const png = canvasRef.current?.exportarPngColorido();
              if (png) imprimirImagem(png);
            }}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
          >
            Imprimir colorida
          </button>
        </div>
      </div>
    </div>
  );
}
