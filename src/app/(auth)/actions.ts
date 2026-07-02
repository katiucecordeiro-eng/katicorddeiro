"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  message?: string | null;
};

function mensagemDeErro(codigo: string): string {
  switch (codigo) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "user_already_exists":
      return "Já existe uma conta com este e-mail.";
    case "weak_password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    default:
      return "Algo deu errado. Tente novamente.";
  }
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mensagemDeErro(error.code ?? "") };
  }

  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nome || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  });

  if (error) {
    return { error: mensagemDeErro(error.code ?? "") };
  }

  if (!data.session) {
    return {
      error: null,
      message: "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
