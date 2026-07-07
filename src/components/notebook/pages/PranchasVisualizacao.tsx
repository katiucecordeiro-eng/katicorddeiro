"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/notebook/PageHeader";
import { PostIt } from "@/components/notebook/PostIt";
import { ZoomPanViewport, type ZoomPanViewportHandle } from "@/components/notebook/ZoomPanViewport";

type ImagemPrancha = { chave: string; url: string; titulo: string };

type PranchasVisualizacaoProps = {
  titulo: string;
  numeroPrancha: string;
  imagemPrincipalUrl: string | null;
  galeria: { id: string; imagem_url: string; titulo: string }[];
};

function imprimirImagem(src: string, titulo: string) {
  const janela = window.open("", "_blank");
  if (!janela) return;
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

export function PranchasVisualizacao({
  titulo,
  numeroPrancha,
  imagemPrincipalUrl,
  galeria,
}: PranchasVisualizacaoProps) {
  const imagens: ImagemPrancha[] = [];
  if (imagemPrincipalUrl) {
    imagens.push({ chave: "principal", url: imagemPrincipalUrl, titulo: "Visão Geral" });
  }
  for (const item of galeria) {
    imagens.push({ chave: item.id, url: item.imagem_url, titulo: item.titulo });
  }

  const [indice, setIndice] = useState(0);
  const [razaoImagem, setRazaoImagem] = useState(3 / 4);
  const viewportRef = useRef<ZoomPanViewportHandle>(null);
  const imagemAtual = imagens[indice];

  function trocarImagem(i: number) {
    setIndice(i);
    setRazaoImagem(3 / 4);
    viewportRef.current?.reset();
  }

  if (imagens.length === 0) {
    return (
      <div className="notebook-page min-h-[70vh] rounded-sm px-6 py-8 sm:px-10 sm:py-10">
        <PageHeader rotulo={numeroPrancha} titulo={titulo} />
        <PostIt cor="azul">A ilustração desta prancha ainda não foi adicionada.</PostIt>
      </div>
    );
  }

  return (
    <div className="notebook-page min-h-[70vh] rounded-sm px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader rotulo={numeroPrancha} titulo={titulo} />

      {imagens.length > 1 && (
        <div className="no-print mb-4 flex flex-wrap gap-2">
          {imagens.map((imagem, i) => (
            <button
              key={imagem.chave}
              type="button"
              onClick={() => trocarImagem(i)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                i === indice
                  ? "bg-wine text-paper"
                  : "border border-line text-ink-soft hover:border-wine hover:text-wine"
              }`}
            >
              {imagem.titulo}
            </button>
          ))}
        </div>
      )}

      <div className="no-print mb-3 flex justify-end gap-1">
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

      <div
        className="mx-auto"
        style={{
          width: `min(100%, 900px, calc(78vh * ${razaoImagem}))`,
          aspectRatio: `${razaoImagem}`,
        }}
      >
        <ZoomPanViewport ref={viewportRef} className="rounded-sm border border-line bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagemAtual.url}
            alt={imagemAtual.titulo}
            className="h-full w-full"
            draggable={false}
            onLoad={(evento) => {
              const { naturalWidth, naturalHeight } = evento.currentTarget;
              if (naturalWidth && naturalHeight) setRazaoImagem(naturalWidth / naturalHeight);
            }}
          />
        </ZoomPanViewport>
      </div>

      <div className="no-print mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => imprimirImagem(imagemAtual.url, `${titulo} — ${imagemAtual.titulo}`)}
          className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine"
        >
          Imprimir esta imagem
        </button>
      </div>
    </div>
  );
}
