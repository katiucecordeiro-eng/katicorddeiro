"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CapaPage } from "@/components/notebook/pages/CapaPage";
import { TeoriaPage } from "@/components/notebook/pages/TeoriaPage";
import { AnotacoesPage } from "@/components/notebook/pages/AnotacoesPage";
import { PranchasVisualizacao } from "@/components/notebook/pages/PranchasVisualizacao";
import type { ConteudoPrancha } from "@/components/notebook/theory-types";
import { registrarTempoEstudo } from "@/lib/actions/estudo";

function agora(): number {
  return Date.now();
}

type GaleriaItem = { id: string; imagem_url: string; titulo: string };

type NotebookViewerProps = {
  pranchaId: string;
  sistemaNome: string;
  sistemaAbertura?: string;
  titulo: string;
  numeroPrancha: string;
  imagemBaseUrl: string | null;
  conteudoPrancha: ConteudoPrancha;
  galeria: GaleriaItem[];
  anotacoesIniciais: string;
};

const PAGINAS = ["capa", "teoria", "anotacoes", "pranchas"] as const;

export function NotebookViewer(props: NotebookViewerProps) {
  const [indice, setIndice] = useState(0);
  const pagina = PAGINAS[indice];
  const largura = pagina === "pranchas" ? "max-w-6xl" : "max-w-3xl";

  // Soma o tempo com a página "teoria" ativa (a leitura em si) e registra
  // o total ao sair da tela — não a cada troca de página.
  const segundosLeituraRef = useRef(0);
  const teoriaDesdeRef = useRef<number | null>(null);

  useEffect(() => {
    if (pagina === "teoria") {
      teoriaDesdeRef.current = agora();
    } else if (teoriaDesdeRef.current !== null) {
      segundosLeituraRef.current += (agora() - teoriaDesdeRef.current) / 1000;
      teoriaDesdeRef.current = null;
    }
  }, [pagina]);

  useEffect(() => {
    return () => {
      if (teoriaDesdeRef.current !== null) {
        segundosLeituraRef.current += (agora() - teoriaDesdeRef.current) / 1000;
      }
      const minutos = Math.round(segundosLeituraRef.current / 60);
      if (minutos > 0) registrarTempoEstudo("leitura", minutos);
    };
  }, []);

  return (
    <div className={`mx-auto flex ${largura} flex-col gap-4`}>
      <div className="no-print flex items-center justify-between text-sm text-ink-soft">
        <Link href="/pranchas" className="hover:text-wine">
          ← Voltar à biblioteca
        </Link>
        <Link
          href={`/estudar/${props.pranchaId}/imprimir`}
          target="_blank"
          className="hover:text-wine"
        >
          Imprimir caderno completo
        </Link>
      </div>

      {pagina === "capa" && (
        <CapaPage
          sistemaNome={props.sistemaNome}
          titulo={props.titulo}
          numeroPrancha={props.numeroPrancha}
          sistemaAbertura={props.sistemaAbertura}
        />
      )}
      {pagina === "teoria" && (
        <TeoriaPage
          titulo={props.titulo}
          numeroPrancha={props.numeroPrancha}
          conteudo={props.conteudoPrancha}
        />
      )}
      {pagina === "anotacoes" && (
        <AnotacoesPage
          pranchaId={props.pranchaId}
          anotacoesIniciais={props.anotacoesIniciais}
        />
      )}
      {pagina === "pranchas" && (
        <PranchasVisualizacao
          titulo={props.titulo}
          numeroPrancha={props.numeroPrancha}
          imagemPrincipalUrl={props.imagemBaseUrl}
          galeria={props.galeria}
        />
      )}

      <div className="no-print flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine disabled:opacity-40"
        >
          ← Página anterior
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="font-hand-note text-sm text-ink-soft">
            página {indice + 1} de {PAGINAS.length}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs text-ink-soft underline hover:text-wine"
          >
            Imprimir esta página
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIndice((i) => Math.min(PAGINAS.length - 1, i + 1))}
          disabled={indice === PAGINAS.length - 1}
          className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-wine hover:text-wine disabled:opacity-40"
        >
          Próxima página →
        </button>
      </div>
    </div>
  );
}
