import { redirect } from "next/navigation";

// Raiz redireciona para o dashboard
export default function Home() {
  redirect("/dashboard");
}
