import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { lessonSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id, teacherId: session.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = lessonSchema.parse(body);

    const existing = await prisma.lesson.findFirst({
      where: { id, teacherId: session.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    }

    await prisma.lessonExercise.deleteMany({ where: { lessonId: id } });

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        exercises: {
          create: data.exerciseIds.map((exerciseId, index) => ({
            exerciseId,
            order: index + 1,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(lesson);
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
  const result = await prisma.lesson.deleteMany({
    where: { id, teacherId: session.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
