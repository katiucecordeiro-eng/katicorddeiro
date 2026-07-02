import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, plano")
    .eq("id", user.id)
    .single();

  return (
    <AppShell nome={profile?.nome || user.email || "Estudante"} plano={profile?.plano ?? "white"}>
      {children}
    </AppShell>
  );
}
