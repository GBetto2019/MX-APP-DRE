import { createClient } from "@/lib/supabase/server";
import DashboardOverview from "@/components/DashboardOverview";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token ?? "";

  return <DashboardOverview token={token} />;
}
