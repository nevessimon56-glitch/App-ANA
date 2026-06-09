import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { exerciseSchema } from "@/lib/validations";
import { toJsonArray } from "@/lib/utils";

export async function GET() {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const exercises = await prisma.exercise.findMany({
    where: { teacherId: session.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(exercises);
}

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = exerciseSchema.parse(body);

    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        description: data.description,
        videoUrl: data.videoUrl,
        difficulty: data.difficulty,
        muscles: toJsonArray(data.muscles),
        contraindications: data.contraindications,
        benefits: data.benefits,
        teacherId: session.id,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
