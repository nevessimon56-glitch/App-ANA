import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { exerciseSchema } from "@/lib/validations";
import { toJsonArray } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const exercise = await prisma.exercise.findFirst({
    where: { id, teacherId: session.id },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
  }

  return NextResponse.json(exercise);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = exerciseSchema.parse(body);

    const exercise = await prisma.exercise.updateMany({
      where: { id, teacherId: session.id },
      data: {
        name: data.name,
        description: data.description,
        videoUrl: data.videoUrl,
        difficulty: data.difficulty,
        muscles: toJsonArray(data.muscles),
        contraindications: data.contraindications,
        benefits: data.benefits,
      },
    });

    if (exercise.count === 0) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    const updated = await prisma.exercise.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await prisma.exercise.deleteMany({
    where: { id, teacherId: session.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
