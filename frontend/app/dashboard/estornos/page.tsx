import { createClient } from "@/lib/supabase/server";
import EstornosView from "@/components/EstornosView";

export default async function EstornosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return <EstornosView token={session?.access_token ?? ""} />;
}
