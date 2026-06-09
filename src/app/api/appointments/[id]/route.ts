import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import type { AppointmentStatus } from "@/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

function parseScheduledAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida");
  }
  return date;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const isTeacher = session.role === "TEACHER" && appointment.teacherId === session.id;
  const isStudent = session.role === "STUDENT" && appointment.studentId === session.id;

  if (!isTeacher && !isStudent) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { status, scheduledAt, lessonId, notes, completeSession, exerciseIds, reschedule } =
    body;

  try {
    if (reschedule && scheduledAt) {
      if (!isTeacher && !isStudent) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }

      const newDate = parseScheduledAt(scheduledAt);
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: "AGENDADA",
          scheduledAt: newDate,
          rescheduledFrom: appointment.scheduledAt.toISOString(),
          notes:
            notes ??
            (appointment.notes
              ? appointment.notes
              : `Remarcada de ${appointment.scheduledAt.toLocaleString("pt-BR")}`),
        },
      });
      return NextResponse.json(updated);
    }

    if (status === "FALTA" && isTeacher) {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "FALTA" },
      });
      return NextResponse.json(updated);
    }

    if (completeSession && isTeacher) {
      const sessionLog = await prisma.$transaction(async (tx) => {
        const updated = await tx.appointment.update({
          where: { id },
          data: { status: "REALIZADA", notes: notes ?? appointment.notes },
        });

        const log = await tx.sessionLog.create({
          data: {
            appointmentId: id,
            teacherNotes: notes,
          },
        });

        if (Array.isArray(exerciseIds) && exerciseIds.length > 0) {
          await tx.exerciseLog.createMany({
            data: exerciseIds.map((exerciseId: string) => ({
              studentId: appointment.studentId,
              exerciseId,
              sessionId: log.id,
              completed: true,
            })),
          });
        } else if (appointment.lessonId) {
          const lessonExercises = await tx.lessonExercise.findMany({
            where: { lessonId: appointment.lessonId },
          });
          await tx.exerciseLog.createMany({
            data: lessonExercises.map((le) => ({
              studentId: appointment.studentId,
              exerciseId: le.exerciseId,
              sessionId: log.id,
              completed: true,
            })),
          });
        }

        return { appointment: updated, sessionLog: log };
      });

      return NextResponse.json(sessionLog);
    }

    if (isTeacher) {
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          ...(status ? { status: status as AppointmentStatus } : {}),
          ...(scheduledAt ? { scheduledAt: parseScheduledAt(scheduledAt) } : {}),
          ...(lessonId !== undefined ? { lessonId } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Ação não permitida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Data ou hora inválida" }, { status: 400 });
  }
}
