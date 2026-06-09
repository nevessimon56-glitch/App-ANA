import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const newName = body.name as string | undefined;

  const lesson = await prisma.lesson.findFirst({
    where: { id, teacherId: session.id },
    include: {
      exercises: { orderBy: { order: "asc" } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  const cloned = await prisma.lesson.create({
    data: {
      name: newName ?? `${lesson.name} (cópia)`,
      description: lesson.description,
      teacherId: session.id,
      exercises: {
        create: lesson.exercises.map((le) => ({
          exerciseId: le.exerciseId,
          order: le.order,
          notes: le.notes,
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

  return NextResponse.json(cloned, { status: 201 });
}
