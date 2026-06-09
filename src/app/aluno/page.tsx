import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [latestAssessment, nextAppointment, exerciseCount] = await Promise.all([
    prisma.assessment.findFirst({
      where: { studentId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appointment.findFirst({
      where: { studentId: session.id, status: { in: ["AGENDADA", "REMARCADA"] } },
      orderBy: { scheduledAt: "asc" },
      include: { lesson: true, teacher: { select: { name: true } } },
    }),
    prisma.exerciseLog.count({ where: { studentId: session.id } }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Olá, ${session.name.split(" ")[0]}!`}
        description="Acompanhe seu progresso e suas aulas de pilates"
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <p className="text-sm text-slate-500">Sua nota atual</p>
          <p className="text-3xl font-bold text-teal-700">
            {latestAssessment?.score.toFixed(1) ?? "—"}/10
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Exercícios realizados</p>
          <p className="text-3xl font-bold text-teal-700">{exerciseCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Próxima aula</p>
          <p className="text-lg font-bold text-teal-700">
            {nextAppointment
              ? format(nextAppointment.scheduledAt, "dd/MM HH:mm", { locale: ptBR })
              : "Nenhuma"}
          </p>
        </Card>
      </div>

      {nextAppointment && (
        <Card className="mb-8">
          <CardTitle>Próxima aula</CardTitle>
          <p className="mt-2 text-slate-700">
            {nextAppointment.lesson?.name ?? "Aula personalizada"}
          </p>
          <p className="text-sm text-slate-500">
            Com {nextAppointment.teacher.name} em{" "}
            {format(nextAppointment.scheduledAt, "dd 'de' MMMM 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
          <Link href="/aluno/agenda" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Ver agenda
            </Button>
          </Link>
        </Card>
      )}

      <Link href="/aluno/progresso">
        <Button>Ver meu progresso completo</Button>
      </Link>
    </div>
  );
}
