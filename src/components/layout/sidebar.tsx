"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  Dumbbell,
  Home,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const teacherNav: NavItem[] = [
  { href: "/professora", label: "Início", icon: <Home className="h-4 w-4" /> },
  {
    href: "/professora/exercicios",
    label: "Exercícios",
    icon: <Dumbbell className="h-4 w-4" />,
  },
  {
    href: "/professora/aulas",
    label: "Aulas",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    href: "/professora/agenda",
    label: "Agenda",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: "/professora/alunos",
    label: "Alunos",
    icon: <Users className="h-4 w-4" />,
  },
];

const studentNav: NavItem[] = [
  { href: "/aluno", label: "Início", icon: <Home className="h-4 w-4" /> },
  {
    href: "/aluno/progresso",
    label: "Meu Progresso",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    href: "/aluno/agenda",
    label: "Minhas Aulas",
    icon: <Calendar className="h-4 w-4" />,
  },
];

export function Sidebar({
  role,
  userName,
}: {
  role: "TEACHER" | "STUDENT";
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "TEACHER" ? teacherNav : studentNav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-teal-100 bg-white">
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
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/professora" &&
              item.href !== "/aluno" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
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
  );
}
