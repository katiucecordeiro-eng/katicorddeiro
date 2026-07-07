"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { calcularMascaraPreenchimento, pintarMascara, type OperacaoPreenchimento } from "@/lib/flood-fill";

const LARGURA_MAXIMA = 1600;
const LIMIAR_ARRASTO = 6;

export type ColoringCanvasHandle = {
  exportarPngColorido: () => string | null;
};

type ColoringCanvasProps = {
  imagemUrl: string;
  corAtual: string;
  operacoes: OperacaoPreenchimento[];
  onNovaOperacao: (operacao: OperacaoPreenchimento) => void;
  onDimensoesNaturais?: (largura: number, altura: number) => void;
};

export const ColoringCanvas = forwardRef<ColoringCanvasHandle, ColoringCanvasProps>(
  function ColoringCanvas(
    { imagemUrl, corAtual, operacoes, onNovaOperacao, onDimensoesNaturais },
    ref
  ) {
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const baseImageDataRef = useRef<ImageData | null>(null);
    const pointerInicioRef = useRef<{ x: number; y: number } | null>(null);
    const [dimensoes, setDimensoes] = useState<{ width: number; height: number } | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      exportarPngColorido: () => {
        const baseCanvas = baseCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!baseCanvas || !overlayCanvas) return null;

        const composto = document.createElement("canvas");
        composto.width = baseCanvas.width;
        composto.height = baseCanvas.height;
        const ctx = composto.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(baseCanvas, 0, 0);
        ctx.drawImage(overlayCanvas, 0, 0);
        try {
          return composto.toDataURL("image/png");
        } catch {
          return null;
        }
      },
    }));

    useEffect(() => {
      let cancelado = false;
      setCarregando(true);
      setErro(null);
      baseImageDataRef.current = null;
      setDimensoes(null);

      const imagem = new Image();
      imagem.crossOrigin = "anonymous";

      imagem.onload = () => {
        if (cancelado) return;
        const baseCanvas = baseCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!baseCanvas || !overlayCanvas) return;

        const escala = Math.min(1, LARGURA_MAXIMA / imagem.width);
        const largura = Math.max(1, Math.round(imagem.width * escala));
        const altura = Math.max(1, Math.round(imagem.height * escala));

        baseCanvas.width = largura;
        baseCanvas.height = altura;
        overlayCanvas.width = largura;
        overlayCanvas.height = altura;

        const baseCtx = baseCanvas.getContext("2d");
        if (!baseCtx) return;
        baseCtx.drawImage(imagem, 0, 0, largura, altura);

        try {
          baseImageDataRef.current = baseCtx.getImageData(0, 0, largura, altura);
        } catch {
          setErro("Não foi possível carregar esta imagem para colorir.");
          setCarregando(false);
          return;
        }

        setDimensoes({ width: largura, height: altura });
        onDimensoesNaturais?.(imagem.width, imagem.height);
        setCarregando(false);
      };

      imagem.onerror = () => {
        if (cancelado) return;
        setErro("Não foi possível carregar esta imagem.");
        setCarregando(false);
      };

      imagem.src = imagemUrl;

      return () => {
        cancelado = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imagemUrl]);

    useEffect(() => {
      if (!dimensoes || !baseImageDataRef.current) return;
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const ctx = overlayCanvas.getContext("2d");
      if (!ctx) return;

      const overlayData = ctx.createImageData(dimensoes.width, dimensoes.height);
      for (const operacao of operacoes) {
        const mascara = calcularMascaraPreenchimento(
          baseImageDataRef.current,
          operacao.x,
          operacao.y
        );
        if (mascara) {
          pintarMascara(overlayData, mascara, operacao.cor);
        }
      }
      ctx.putImageData(overlayData, 0, 0);
    }, [operacoes, dimensoes]);

    function coordenadasDoEvento(
      clienteX: number,
      clienteY: number
    ): { x: number; y: number } | null {
      const canvas = overlayCanvasRef.current;
      if (!canvas || !dimensoes) return null;
      const retangulo = canvas.getBoundingClientRect();
      if (retangulo.width === 0 || retangulo.height === 0) return null;

      return {
        x: Math.round(((clienteX - retangulo.left) / retangulo.width) * dimensoes.width),
        y: Math.round(((clienteY - retangulo.top) / retangulo.height) * dimensoes.height),
      };
    }

    // Usa pointer events com limiar de arrasto (em vez de click/touchstart)
    // para funcionar corretamente dentro do viewport com zoom/pan: um toque
    // que se transforma em arrasto para navegar pela imagem não deve pintar.
    function aoPointerDown(evento: React.PointerEvent<HTMLCanvasElement>) {
      pointerInicioRef.current = { x: evento.clientX, y: evento.clientY };
    }

    function aoPointerUp(evento: React.PointerEvent<HTMLCanvasElement>) {
      const inicio = pointerInicioRef.current;
      pointerInicioRef.current = null;
      if (!inicio) return;
      const moveu = Math.hypot(evento.clientX - inicio.x, evento.clientY - inicio.y) > LIMIAR_ARRASTO;
      if (moveu) return;
      const ponto = coordenadasDoEvento(evento.clientX, evento.clientY);
      if (ponto) onNovaOperacao({ ...ponto, cor: corAtual });
    }

    return (
      <div className="relative h-full w-full touch-none select-none">
        <canvas ref={baseCanvasRef} className="absolute inset-0 h-full w-full rounded-sm" />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onPointerDown={aoPointerDown}
          onPointerUp={aoPointerUp}
        />
        {carregando && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
            <p className="font-hand-note text-ink-soft">Carregando ilustração…</p>
          </div>
        )}
        {erro && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/90 p-4 text-center">
            <p className="font-hand-note text-wine">{erro}</p>
          </div>
        )}
      </div>
    );
  }
);
