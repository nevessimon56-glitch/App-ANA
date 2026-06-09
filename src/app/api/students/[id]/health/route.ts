import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { healthConditionsToJson } from "@/lib/health";
import { z } from "zod";

const healthSchema = z.object({
  healthConditions: z.array(z.string()),
  healthNotes: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = healthSchema.parse(body);

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: id, teacherId: session.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        healthConditions: healthConditionsToJson(data.healthConditions),
        healthNotes: data.healthNotes,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
