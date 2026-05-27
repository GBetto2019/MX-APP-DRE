import { createClient } from "@/lib/supabase/server";
import RepassesView from "@/components/RepassesView";

export default async function RepassesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return <RepassesView token={session?.access_token ?? ""} />;
}
