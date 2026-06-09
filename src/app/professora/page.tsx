import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Dumbbell, Users } from "lucide-react";

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [exerciseCount, lessonCount, studentCount, todayAppointments] =
    await Promise.all([
      prisma.exercise.count({ where: { teacherId: session.id } }),
      prisma.lesson.count({ where: { teacherId: session.id } }),
      prisma.studentProfile.count({ where: { teacherId: session.id } }),
      prisma.appointment.findMany({
        where: {
          teacherId: session.id,
          scheduledAt: { gte: today, lt: tomorrow },
          status: "AGENDADA",
        },
        include: {
          student: { select: { name: true } },
          lesson: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

  return (
    <div>
      <PageHeader
        title={`Olá, ${session.name.split(" ")[0]}!`}
        description="Resumo do seu dia e atalhos rápidos"
        action={
          <Link href="/professora/exercicios/novo">
            <Button>Novo exercício</Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3">
              <Dumbbell className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{exerciseCount}</p>
              <p className="text-sm text-slate-500">Exercícios cadastrados</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3">
              <Calendar className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{lessonCount}</p>
              <p className="text-sm text-slate-500">Aulas montadas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3">
              <Users className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{studentCount}</p>
              <p className="text-sm text-slate-500">Alunos ativos</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Aulas de hoje</CardTitle>
        {todayAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhuma aula agendada para hoje.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-teal-50">
            {todayAppointments.map((appt) => (
              <li key={appt.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800">{appt.student.name}</p>
                  <p className="text-sm text-slate-500">
                    {appt.lesson?.name ?? "Aula sem sequência definida"}
                  </p>
                </div>
                <p className="text-sm font-medium text-teal-700">
                  {format(appt.scheduledAt, "HH:mm", { locale: ptBR })}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link href="/professora/agenda" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Ver agenda completa
          </Button>
        </Link>
      </Card>
    </div>
  );
}
