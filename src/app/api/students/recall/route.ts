import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { z } from "zod";

const recallSchema = z.object({
  studentId: z.string(),
});

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { studentId } = recallSchema.parse(body);

    const lastTransfer = await prisma.studentTransfer.findFirst({
      where: {
        studentUserId: studentId,
        fromTeacherId: session.id,
      },
      orderBy: { transferredAt: "desc" },
    });

    if (!lastTransfer) {
      return NextResponse.json(
        { error: "Nenhuma transferência encontrada para este aluno" },
        { status: 404 },
      );
    }

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: studentId },
    });

    if (!profile || profile.teacherId !== lastTransfer.toTeacherId) {
      return NextResponse.json(
        { error: "Este aluno já está com outra professora e não pode ser trazido de volta automaticamente" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentProfile.update({
        where: { id: profile.id },
        data: { teacherId: session.id },
      });

      await tx.appointment.updateMany({
        where: {
          studentId,
          teacherId: lastTransfer.toTeacherId,
          status: { in: ["AGENDADA", "REMARCADA"] },
        },
        data: { teacherId: session.id },
      });

      await tx.studentTransfer.create({
        data: {
          studentUserId: studentId,
          fromTeacherId: lastTransfer.toTeacherId,
          toTeacherId: session.id,
          reason: "Devolvido à professora original",
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível trazer o aluno de volta" }, { status: 400 });
  }
}
