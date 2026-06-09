import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { teacherId: session.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  const enriched = await Promise.all(
    students.map(async (profile) => {
      const [latestAssessment, appointmentCount, exerciseCount] = await Promise.all([
        prisma.assessment.findFirst({
          where: { studentId: profile.userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.appointment.count({
          where: { studentId: profile.userId, teacherId: session.id },
        }),
        prisma.exerciseLog.count({
          where: { studentId: profile.userId },
        }),
      ]);

      return {
        ...profile,
        latestAssessment,
        appointmentCount,
        exerciseCount,
      };
    }),
  );

  return NextResponse.json(enriched);
}
