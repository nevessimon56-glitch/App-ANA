import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { transferSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = transferSchema.parse(body);

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: data.studentId, teacherId: session.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Aluno não encontrado na sua lista" },
        { status: 404 },
      );
    }

    const toTeacher = await prisma.user.findFirst({
      where: { id: data.toTeacherId, role: "TEACHER" },
    });

    if (!toTeacher) {
      return NextResponse.json(
        { error: "Professora destino não encontrada" },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.studentTransfer.create({
        data: {
          studentUserId: data.studentId,
          fromTeacherId: session.id,
          toTeacherId: data.toTeacherId,
          reason: data.reason,
        },
      });

      await tx.studentProfile.update({
        where: { id: profile.id },
        data: { teacherId: data.toTeacherId },
      });

      await tx.appointment.updateMany({
        where: {
          studentId: data.studentId,
          teacherId: session.id,
          status: { in: ["AGENDADA", "REMARCADA"] },
        },
        data: { teacherId: data.toTeacherId },
      });

      return transfer;
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}

export async function GET() {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", NOT: { id: session.id } },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(teachers);
}
