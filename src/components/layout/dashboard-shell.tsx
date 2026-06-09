"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isNavActive,
  studentNav,
  teacherNav,
  type NavItem,
} from "@/components/layout/nav-config";

function NavLink({
  item,
  pathname,
  onNavigate,
  compact,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const active = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl font-medium transition-colors",
        compact
          ? "flex-col gap-1 px-1 py-2 text-[10px] leading-tight"
          : "px-3 py-2.5 text-sm",
        active
          ? compact
            ? "text-teal-700"
            : "bg-teal-50 text-teal-800"
          : compact
            ? "text-slate-500"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      <span
        className={cn(
          compact && "flex h-8 w-8 items-center justify-center rounded-full",
          compact && active && "bg-teal-100",
        )}
      >
        {item.icon}
      </span>
      <span className={cn(compact && "max-w-[4.5rem] truncate text-center")}>
        {compact ? (item.shortLabel ?? item.label) : item.label}
      </span>
    </Link>
  );
}

export function DashboardShell({
  role,
  userName,
  children,
}: {
  role: "TEACHER" | "STUDENT";
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = role === "TEACHER" ? teacherNav : studentNav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf9] lg:flex-row">
      {/* Sidebar — só desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-teal-100 bg-white lg:flex">
        <div className="border-b border-teal-100 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            App ANA
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">{userName}</p>
          <p className="text-xs text-slate-500">
            {role === "TEACHER" ? "Professora" : "Aluno"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="border-t border-teal-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Cabeçalho mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-teal-100 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            App ANA
          </p>
          <p className="text-sm font-medium text-slate-800">{userName}</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-100 text-slate-700"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="absolute right-0 flex h-full w-[min(100%,280px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-teal-100 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Menu</p>
                <p className="text-xs text-slate-500">
                  {role === "TEACHER" ? "Professora" : "Aluno"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="border-t border-teal-100 p-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 pb-24 lg:p-8 lg:pb-8">
        {children}
      </main>

      {/* Navegação inferior — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-teal-100 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div
          className={cn(
            "grid items-stretch",
            nav.length === 5 ? "grid-cols-5" : "grid-cols-3",
          )}
        >
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              compact
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
