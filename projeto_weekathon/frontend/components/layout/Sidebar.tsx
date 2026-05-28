"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, List, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Novo Exame", icon: Upload },
  { href: "/exams", label: "Todos os Exames", icon: List },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 leading-tight">RadIA</p>
            <p className="text-xs text-gray-400">Triagem Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-blue-600" : "text-gray-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          A IA <strong>sugere</strong> prioridade.
          <br />A decisão final é do radiologista.
        </p>
      </div>
    </aside>
  );
}
