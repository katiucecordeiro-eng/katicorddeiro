"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type ZoomPanViewportHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

type Estado = { escala: number; x: number; y: number };

const ESCALA_MIN = 1;
const ESCALA_MAX = 4;
const PASSO_ZOOM = 0.5;
const LIMIAR_ARRASTO = 6;

function limitarEscala(escala: number) {
  return Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala));
}

function distanciaEntreToques(a: React.Touch, b: React.Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

type ZoomPanViewportProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const ZoomPanViewport = forwardRef<ZoomPanViewportHandle, ZoomPanViewportProps>(
  function ZoomPanViewport({ children, className = "", style }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [estado, setEstado] = useState<Estado>({ escala: 1, x: 0, y: 0 });
    const pointersAtivosRef = useRef<Set<number>>(new Set());
    const arrastoRef = useRef<{
      inicioX: number;
      inicioY: number;
      estadoInicial: Estado;
      moveu: boolean;
    } | null>(null);
    const pinchRef = useRef<{ distanciaInicial: number; escalaInicial: number } | null>(null);

    function ajustarEscala(novaEscala: number) {
      setEstado((atual) => {
        const escala = limitarEscala(novaEscala);
        if (escala === ESCALA_MIN) return { escala: 1, x: 0, y: 0 };
        return { ...atual, escala };
      });
    }

    useImperativeHandle(ref, () => ({
      zoomIn: () => ajustarEscala(estado.escala + PASSO_ZOOM),
      zoomOut: () => ajustarEscala(estado.escala - PASSO_ZOOM),
      reset: () => setEstado({ escala: 1, x: 0, y: 0 }),
    }));

    function bloquearProximoClique() {
      const container = containerRef.current;
      if (!container) return;
      const bloquear = (evento: Event) => {
        evento.stopPropagation();
        container.removeEventListener("click", bloquear, true);
      };
      container.addEventListener("click", bloquear, true);
    }

    function aoPointerDown(evento: React.PointerEvent) {
      pointersAtivosRef.current.add(evento.pointerId);
      if (estado.escala <= ESCALA_MIN || pointersAtivosRef.current.size > 1) return;
      arrastoRef.current = {
        inicioX: evento.clientX,
        inicioY: evento.clientY,
        estadoInicial: estado,
        moveu: false,
      };
    }

    function aoPointerMove(evento: React.PointerEvent) {
      const arrasto = arrastoRef.current;
      if (!arrasto || pointersAtivosRef.current.size > 1) return;
      const deltaX = evento.clientX - arrasto.inicioX;
      const deltaY = evento.clientY - arrasto.inicioY;
      if (Math.hypot(deltaX, deltaY) > LIMIAR_ARRASTO) arrasto.moveu = true;
      if (arrasto.moveu) {
        setEstado({
          escala: arrasto.estadoInicial.escala,
          x: arrasto.estadoInicial.x + deltaX,
          y: arrasto.estadoInicial.y + deltaY,
        });
      }
    }

    function encerrarPointer(evento: React.PointerEvent) {
      pointersAtivosRef.current.delete(evento.pointerId);
      const arrasto = arrastoRef.current;
      if (arrasto?.moveu) bloquearProximoClique();
      arrastoRef.current = null;
    }

    function aoRodaMouse(evento: React.WheelEvent) {
      evento.preventDefault();
      ajustarEscala(estado.escala + (evento.deltaY < 0 ? PASSO_ZOOM : -PASSO_ZOOM));
    }

    function aoTocarInicio(evento: React.TouchEvent) {
      if (evento.touches.length === 2) {
        arrastoRef.current = null;
        pinchRef.current = {
          distanciaInicial: distanciaEntreToques(evento.touches[0], evento.touches[1]),
          escalaInicial: estado.escala,
        };
      }
    }

    function aoTocarMover(evento: React.TouchEvent) {
      if (evento.touches.length === 2 && pinchRef.current) {
        evento.preventDefault();
        const distanciaAtual = distanciaEntreToques(evento.touches[0], evento.touches[1]);
        const fator = distanciaAtual / pinchRef.current.distanciaInicial;
        ajustarEscala(pinchRef.current.escalaInicial * fator);
      }
    }

    function aoTocarFim(evento: React.TouchEvent) {
      if (evento.touches.length < 2) pinchRef.current = null;
    }

    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full touch-none select-none overflow-hidden ${className}`}
        style={{ cursor: estado.escala > ESCALA_MIN ? "grab" : "default", ...style }}
        onPointerDown={aoPointerDown}
        onPointerMove={aoPointerMove}
        onPointerUp={encerrarPointer}
        onPointerCancel={encerrarPointer}
        onPointerLeave={encerrarPointer}
        onWheel={aoRodaMouse}
        onTouchStart={aoTocarInicio}
        onTouchMove={aoTocarMover}
        onTouchEnd={aoTocarFim}
      >
        <div
          className="h-full w-full"
          style={{
            transform: `translate(${estado.x}px, ${estado.y}px) scale(${estado.escala})`,
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
