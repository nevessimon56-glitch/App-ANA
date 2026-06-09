import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter =
    from || to
      ? {
          scheduledAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  const appointments = await prisma.appointment.findMany({
    where:
      session.role === "TEACHER"
        ? { teacherId: session.id, ...dateFilter }
        : { studentId: session.id, ...dateFilter },
    include: {
      student: { select: { id: true, name: true, email: true } },
      teacher: { select: { id: true, name: true } },
      lesson: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      },
      sessionLogs: {
        include: {
          exerciseLogs: { include: { exercise: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = appointmentSchema.parse(body);

    const scheduledAt = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Data ou hora inválida" }, { status: 400 });
    }

    const student = await prisma.studentProfile.findFirst({
      where: { userId: data.studentId, teacherId: session.id },
    });
    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        teacherId: session.id,
        studentId: data.studentId,
        lessonId: data.lessonId || null,
        scheduledAt,
        durationMinutes: data.durationMinutes ?? 60,
        notes: data.notes,
      },
      include: {
        student: { select: { id: true, name: true } },
        lesson: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
