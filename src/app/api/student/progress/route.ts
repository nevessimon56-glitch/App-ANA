import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession("STUDENT");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [assessments, exerciseLogs, appointments, profile] = await Promise.all([
    prisma.assessment.findMany({
      where: { studentId: session.id },
      orderBy: { createdAt: "asc" },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.exerciseLog.findMany({
      where: { studentId: session.id },
      include: { exercise: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: { studentId: session.id },
      include: {
        lesson: true,
        teacher: { select: { name: true } },
      },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: session.id },
      include: { teacher: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = {
    totalClasses: appointments.filter((a) => a.status === "REALIZADA").length,
    missedClasses: appointments.filter((a) => a.status === "FALTA").length,
    upcomingClasses: appointments.filter((a) =>
      ["AGENDADA", "REMARCADA"].includes(a.status),
    ).length,
    totalExercises: exerciseLogs.length,
    currentScore: assessments.at(-1)?.score ?? 0,
    initialScore: assessments.at(0)?.score ?? 0,
  };

  return NextResponse.json({
    stats,
    assessments,
    exerciseLogs,
    appointments,
    profile,
  });
}
