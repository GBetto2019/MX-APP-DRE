import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConfiguracoesView from "@/components/ConfiguracoesView";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verifica se é admin direto no banco
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (perfil?.role !== "admin") {
    redirect("/dashboard");
  }

  return <ConfiguracoesView token={session.access_token} />;
}
