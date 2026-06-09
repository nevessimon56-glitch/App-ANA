import {
  Calendar,
  ClipboardList,
  Dumbbell,
  Home,
  TrendingUp,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
};

export const teacherNav: NavItem[] = [
  {
    href: "/professora",
    label: "Início",
    shortLabel: "Início",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/professora/exercicios",
    label: "Exercícios",
    shortLabel: "Exercícios",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    href: "/professora/aulas",
    label: "Aulas",
    shortLabel: "Aulas",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/professora/agenda",
    label: "Agenda",
    shortLabel: "Agenda",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: "/professora/alunos",
    label: "Alunos",
    shortLabel: "Alunos",
    icon: <Users className="h-5 w-5" />,
  },
];

export const studentNav: NavItem[] = [
  {
    href: "/aluno",
    label: "Início",
    shortLabel: "Início",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/aluno/progresso",
    label: "Meu Progresso",
    shortLabel: "Progresso",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    href: "/aluno/agenda",
    label: "Minhas Aulas",
    shortLabel: "Aulas",
    icon: <Calendar className="h-5 w-5" />,
  },
];

export function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/professora" || href === "/aluno") return false;
  return pathname.startsWith(href);
}
