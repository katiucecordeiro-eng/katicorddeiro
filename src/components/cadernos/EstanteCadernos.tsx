"use client";

import { useState } from "react";
import { CadernoCard, type CadernoResumo } from "@/components/cadernos/CadernoCard";

type EstanteCadernosProps = {
  cadernos: CadernoResumo[];
  acessoTotal: boolean;
};

export function EstanteCadernos({ cadernos, acessoTotal }: EstanteCadernosProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) {
        proximo.delete(id);
      } else {
        proximo.add(id);
      }
      return proximo;
    });
  }

  async function baixarSelecionados() {
    setErro(null);
    setBaixando(true);
    try {
      const resposta = await fetch("/cadernos/mesclar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selecionados) }),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao gerar o PDF mesclado.");
      }

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "asterik-cadernos.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não foi possível baixar os cadernos selecionados. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {cadernos.map((caderno) => {
          const bloqueado = !acessoTotal && !caderno.disponivel_no_white;
          return (
            <CadernoCard
              key={caderno.id}
              caderno={caderno}
              bloqueado={bloqueado}
              selecionado={selecionados.has(caderno.id)}
              onToggleSelecao={() => alternarSelecao(caderno.id)}
            />
          );
        })}
      </div>

      {selecionados.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4">
          <div className="border-ornamental flex items-center gap-4 rounded-sm bg-paper px-5 py-3 shadow-lg">
            <span className="font-hand-note text-sm text-ink">
              {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
            </span>
            {erro && <span className="text-sm text-wine">{erro}</span>}
            <button
              type="button"
              onClick={() => setSelecionados(new Set())}
              className="text-sm text-ink-soft hover:text-wine"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={baixarSelecionados}
              disabled={baixando}
              className="rounded-sm bg-wine px-4 py-2 text-sm font-medium text-paper hover:bg-wine-dark disabled:opacity-60"
            >
              {baixando ? "Preparando…" : "Baixar mesclado"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
