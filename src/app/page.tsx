import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "TEACHER") redirect("/professora");
  if (session?.role === "STUDENT") redirect("/aluno");

  const features = [
    {
      icon: <Dumbbell className="h-6 w-6 text-teal-700" />,
      title: "Biblioteca de Exercícios",
      description:
        "Cadastre vídeos, nível de dificuldade, musculatura trabalhada e contraindicações.",
    },
    {
      icon: <ClipboardList className="h-6 w-6 text-teal-700" />,
      title: "Montagem de Aulas",
      description:
        "Monte sequências de exercícios selecionando da sua biblioteca, como você planeja no Word.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-teal-700" />,
      title: "Agenda Integrada",
      description:
        "Controle sua agenda, veja quais alunos vêm em cada dia e já selecione os exercícios.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-teal-700" />,
      title: "Progresso do Aluno",
      description:
        "Avaliações de 0 a 10, histórico de exercícios e evolução ao longo do tempo.",
    },
    {
      icon: <Users className="h-6 w-6 text-teal-700" />,
      title: "Gestão de Alunos",
      description:
        "Remarcação de aulas, registro de faltas e transferência para outra professora.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            App ANA
          </p>
          <p className="text-xs text-slate-500">Pilates com autonomia</p>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Cadastrar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Sua plataforma de Pilates
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Organize exercícios, monte aulas, controle a agenda e acompanhe o
            progresso dos seus alunos — tudo em um só lugar. Inspirado no que
            você precisa, como o MFIT Personal.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Começar agora</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
