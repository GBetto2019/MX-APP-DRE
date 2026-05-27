"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  TrendingDown,
  Target,
  ArrowRightLeft,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",             label: "Visão Geral",  icon: LayoutDashboard },
  { href: "/dashboard/dre",         label: "DRE",          icon: BarChart3 },
  { href: "/dashboard/lancamentos", label: "Lançamentos",  icon: BookOpen },
  { href: "/dashboard/estornos",    label: "Estornos",     icon: TrendingDown },
  { href: "/dashboard/metas",       label: "Metas",        icon: Target },
  { href: "/dashboard/repasses",    label: "Repasses",     icon: ArrowRightLeft },
  { href: "/dashboard/chat",        label: "Assistente IA",icon: MessageSquare },
];

interface SidebarProps {
  userEmail: string;
  userRole:  string;
}

export default function Sidebar({ userEmail, userRole }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex flex-col text-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ backgroundColor: "#0C1934" }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center px-4 py-5 min-h-[72px]"
        style={{ borderBottom: "1px solid rgba(202,227,242,0.15)" }}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(202,227,242,0.15)" }}>
            <span className="text-xs font-bold" style={{ color: "#CAE3F2" }}>MX</span>
          </div>
        ) : (
          <Image
            src="/logos/logo_03.png"
            alt="MX Seguros"
            width={130}
            height={33}
            className="object-contain"
          />
        )}
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 rounded-full p-0.5 border-2 border-white transition-colors z-10"
        style={{ backgroundColor: "#1E3A5F" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2A4F7A")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A5F")}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const ativo =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group",
                ativo ? "text-white" : "hover:text-white"
              )}
              style={
                ativo
                  ? { backgroundColor: "rgba(202,227,242,0.15)", color: "#CAE3F2" }
                  : { color: "rgba(202,227,242,0.65)" }
              }
              onMouseEnter={(e) => { if (!ativo) e.currentTarget.style.backgroundColor = "rgba(202,227,242,0.08)"; }}
              onMouseLeave={(e) => { if (!ativo) e.currentTarget.style.backgroundColor = "transparent"; }}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: configurações (admin) + email + logout */}
      <div className="px-2 py-3 space-y-1" style={{ borderTop: "1px solid rgba(202,227,242,0.15)" }}>
        {userRole === "admin" && (
          <Link
            href="/dashboard/configuracoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            )}
            style={
              pathname.startsWith("/dashboard/configuracoes")
                ? { backgroundColor: "rgba(202,227,242,0.15)", color: "#CAE3F2" }
                : { color: "rgba(202,227,242,0.65)" }
            }
            onMouseEnter={(e) => { if (!pathname.startsWith("/dashboard/configuracoes")) e.currentTarget.style.backgroundColor = "rgba(202,227,242,0.08)"; }}
            onMouseLeave={(e) => { if (!pathname.startsWith("/dashboard/configuracoes")) e.currentTarget.style.backgroundColor = "transparent"; }}
            title={collapsed ? "Configurações" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>
        )}

        {!collapsed && (
          <p className="text-xs px-3 truncate" style={{ color: "rgba(181,168,130,0.8)" }}>{userEmail}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
          style={{ color: "rgba(202,227,242,0.65)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(202,227,242,0.08)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(202,227,242,0.65)"; }}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
