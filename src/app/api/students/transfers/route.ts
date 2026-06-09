import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const transfers = await prisma.studentTransfer.findMany({
    where: { fromTeacherId: session.id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      toTeacher: { select: { id: true, name: true } },
    },
    orderBy: { transferredAt: "desc" },
  });

  const enriched = await Promise.all(
    transfers.map(async (transfer) => {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: transfer.studentUserId },
      });
      const canRecall = profile?.teacherId === transfer.toTeacherId;
      return { ...transfer, canRecall };
    }),
  );

  return NextResponse.json(enriched);
}
