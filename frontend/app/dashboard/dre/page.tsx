import { createClient } from "@/lib/supabase/server";
import DREView from "@/components/DREView";

export default async function DREPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <DREView token={session?.access_token ?? ""} />;
}
