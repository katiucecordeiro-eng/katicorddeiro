import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Entrar — Asterik" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-ink">
        Entrar
      </h1>
      <LoginForm />
    </div>
  );
}
