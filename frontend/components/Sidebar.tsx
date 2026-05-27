"use client";

import Link from "next/link";
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
        "flex flex-col bg-blue-900 text-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-900 text-xs font-bold">MX</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg truncate">MX Seguros</span>
        )}
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-blue-700 rounded-full p-0.5 border-2 border-white hover:bg-blue-600 transition-colors z-10"
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
                ativo
                  ? "bg-blue-700 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )}
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
      <div className="border-t border-blue-800 px-2 py-3 space-y-1">
        {userRole === "admin" && (
          <Link
            href="/dashboard/configuracoes"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
              pathname.startsWith("/dashboard/configuracoes")
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-800 hover:text-white"
            )}
            title={collapsed ? "Configurações" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>
        )}

        {!collapsed && (
          <p className="text-blue-300 text-xs px-3 truncate">{userEmail}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
