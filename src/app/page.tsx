import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-24 text-center">
      <p className="text-xs tracking-[0.3em] text-gold uppercase">
        Atlas de Anatomia
      </p>
      <h1 className="mt-4 font-serif text-5xl font-semibold text-wine sm:text-6xl">
        Asterik
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink-soft">
        O caderno de estudo digital de anatomia para estudantes de medicina,
        enfermagem e áreas da saúde. Colora pranchas estilo atlas científico,
        faça anotações, teste-se em quizzes e estude com Pomodoro integrado.
      </p>
      <div className="mt-10 flex gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-sm bg-wine px-6 py-3 font-medium text-paper hover:bg-wine-dark"
          >
            Ir para o Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/cadastro"
              className="rounded-sm bg-wine px-6 py-3 font-medium text-paper hover:bg-wine-dark"
            >
              Criar conta
            </Link>
            <Link
              href="/login"
              className="rounded-sm border border-line px-6 py-3 font-medium text-ink hover:border-wine hover:text-wine"
            >
              Entrar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
