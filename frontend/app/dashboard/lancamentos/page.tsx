import { createClient } from "@/lib/supabase/server";
import LancamentosView from "@/components/LancamentosView";

export default async function LancamentosPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <LancamentosView token={session?.access_token ?? ""} />;
}
