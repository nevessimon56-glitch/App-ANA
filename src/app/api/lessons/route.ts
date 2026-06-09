import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { lessonSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { teacherId: session.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { appointments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(lessons);
}

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = lessonSchema.parse(body);

    const lesson = await prisma.lesson.create({
      data: {
        name: data.name,
        description: data.description,
        teacherId: session.id,
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

    return NextResponse.json(lesson, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
