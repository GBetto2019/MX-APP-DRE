import { createClient } from "@/lib/supabase/server";
import MetasView from "@/components/MetasView";

export default async function MetasPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return <MetasView token={session?.access_token ?? ""} />;
}
