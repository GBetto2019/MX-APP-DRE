import { createClient } from "@/lib/supabase/server";
import ChatView from "@/components/ChatView";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return <ChatView token={session?.access_token ?? ""} />;
}
