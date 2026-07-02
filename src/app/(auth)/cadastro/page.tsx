import type { Metadata } from "next";
import { CadastroForm } from "@/components/auth/CadastroForm";

export const metadata: Metadata = { title: "Criar conta — Asterik" };

export default function CadastroPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-ink">
        Criar conta
      </h1>
      <CadastroForm />
    </div>
  );
}
