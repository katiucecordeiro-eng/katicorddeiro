"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PageHeader } from "@/components/notebook/PageHeader";
import { ColoringCanvas, type ColoringCanvasHandle } from "@/components/coloring/ColoringCanvas";
import { PaletaCores, type ItemLegendaCor } from "@/components/coloring/PaletaCores";
import { ZoomPanViewport, type ZoomPanViewportHandle } from "@/components/coloring/ZoomPanViewport";
import { RotulosOverlay, type Rotulo } from "@/components/coloring/RotulosOverlay";
import type { OperacaoPreenchimento } from "@/lib/flood-fill";
import { salvarCoresPreenchidas } from "@/app/(app)/estudar/[prancha_id]/coloring-actions";

type ImagemColorivel = {
  chave: string;
  url: string;
  titulo: string;
};

type RotuloBruto = {
  id: string;
  prancha_imagem_id: string | null;
  texto: string;
  pos_x: number;
  pos_y: number;
  ordem: number;
};

type IlustracaoColorivelProps = {
  pranchaId: string;
  titulo: string;
  numeroPrancha: string;
  imagemPrincipalUrl: string | null;
  legendaCoresJson: unknown;
  galeria: { id: string; imagem_url: string; titulo: string }[];
  rotulos: RotuloBruto[];
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

function imprimirImagem(src: string, titulo: string) {
  const janela = window.open("", "_blank");
  if (!janela) return;
  // object-fit: contain + limites em vh/vw fazem a imagem caber inteira em
  // uma página, seja qual for o tamanho de papel escolhido no diálogo de
  // impressão (A4, Carta, etc.) — evita que o conteúdo seja cortado ou
  // dividido em páginas extras.
  janela.document.write(
    `<html><head><title>${titulo}</title><style>` +
      `@page { margin: 10mm; }` +
      `html, body { margin: 0; padding: 0; height: 100%; }` +
      `body { display: flex; align-items: center; justify-content: center; }` +
      `img { max-width: 100vw; max-height: 100vh; width: auto; height: auto; object-fit: contain; }` +
      `</style></head><body>` +
      `<img src="${src}" onload="window.print()" />` +
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
  rotulos,
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
  const [mostrarNomes, setMostrarNomes] = useState(true);
  const [revelados, setRevelados] = useState<Set<string>>(new Set());
  const [razaoImagem, setRazaoImagem] = useState(3 / 4);
  const [, startTransition] = useTransition();
  const canvasRef = useRef<ColoringCanvasHandle>(null);
  const viewportRef = useRef<ZoomPanViewportHandle>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [indicePrevio, setIndicePrevio] = useState(indiceAtual);

  const imagemAtual = imagens[indiceAtual];
  const operacoesAtuais = (imagemAtual && operacoesPorImagem[imagemAtual.chave]) || [];

  const rotulosAtuais: Rotulo[] = useMemo(() => {
    if (!imagemAtual) return [];
    const doImagem =
      imagemAtual.chave === "principal"
        ? rotulos.filter((r) => r.prancha_imagem_id === null)
        : rotulos.filter((r) => r.prancha_imagem_id === imagemAtual.chave);
    return [...doImagem]
      .sort((a, b) => a.ordem - b.ordem)
      .map((r) => ({ id: r.id, texto: r.texto, pos_x: r.pos_x, pos_y: r.pos_y }));
  }, [rotulos, imagemAtual]);

  useEffect(() => {
    return () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    };
  }, []);

  // Reseta a revelação de rótulos ao trocar de imagem (padrão React de
  // ajustar estado durante a renderização, evitando um efeito em cascata).
  if (indiceAtual !== indicePrevio) {
    setIndicePrevio(indiceAtual);
    if (revelados.size > 0) setRevelados(new Set());
  }

  useEffect(() => {
    viewportRef.current?.reset();
  }, [indiceAtual]);

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

  function aoTocarRotulo(id: string) {
    setRevelados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
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
    <div className="notebook-page min-h-[70vh] rounded-sm px-4 py-6 sm:px-8 sm:py-8">
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

      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMostrarNomes((atual) => !atual)}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
            mostrarNomes
              ? "border border-line text-ink-soft hover:border-wine hover:text-wine"
              : "bg-wine text-paper"
          }`}
        >
          {mostrarNomes ? "Ocultar nomes (modo estudo)" : "Mostrar nomes"}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => viewportRef.current?.zoomOut()}
            aria-label="Diminuir zoom"
            className="h-8 w-8 rounded-sm border border-line text-ink-soft hover:border-wine hover:text-wine"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => viewportRef.current?.reset()}
            className="rounded-sm border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:border-wine hover:text-wine"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => viewportRef.current?.zoomIn()}
            aria-label="Aumentar zoom"
            className="h-8 w-8 rounded-sm border border-line text-ink-soft hover:border-wine hover:text-wine"
          >
            +
          </button>
        </div>
      </div>

      {!mostrarNomes && rotulosAtuais.length > 0 && (
        <p className="font-hand-note no-print mb-2 text-sm text-ink-soft">
          Toque nos marcadores para revelar o nome de cada estrutura.
        </p>
      )}
      {rotulosAtuais.length === 0 && (
        <p className="font-hand-note no-print mb-2 text-xs text-ink-soft/70">
          Nenhum rótulo cadastrado para esta imagem ainda.
        </p>
      )}

      <div
        className="mx-auto"
        style={{
          width: `min(100%, 900px, calc(78vh * ${razaoImagem}))`,
          aspectRatio: `${razaoImagem}`,
        }}
      >
        <ZoomPanViewport
          ref={viewportRef}
          className="rounded-sm border border-line bg-paper"
        >
          <div className="relative h-full w-full">
            <ColoringCanvas
              ref={canvasRef}
              imagemUrl={imagemAtual.url}
              corAtual={corAtual}
              operacoes={operacoesAtuais}
              onNovaOperacao={aoNovaOperacao}
              onDimensoesNaturais={(largura, altura) => setRazaoImagem(largura / altura)}
            />
            <RotulosOverlay
              rotulos={rotulosAtuais}
              mostrarNomes={mostrarNomes}
              revelados={revelados}
              onTocarRotulo={aoTocarRotulo}
            />
          </div>
        </ZoomPanViewport>
      </div>

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
            onClick={() => imprimirImagem(imagemAtual.url, `${titulo} — ${imagemAtual.titulo}`)}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
          >
            Imprimir em branco
          </button>
          <button
            type="button"
            onClick={() => {
              const png = canvasRef.current?.exportarPngColorido();
              if (png) imprimirImagem(png, `${titulo} — ${imagemAtual.titulo} (colorida)`);
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
