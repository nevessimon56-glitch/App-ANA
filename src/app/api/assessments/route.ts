import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assessmentSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  const assessments = await prisma.assessment.findMany({
    where:
      session.role === "TEACHER"
        ? {
            teacherId: session.id,
            ...(studentId ? { studentId } : {}),
          }
        : { studentId: session.id },
    include: {
      student: { select: { id: true, name: true } },
      teacher: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = assessmentSchema.parse(body);

    const assessment = await prisma.assessment.create({
      data: {
        studentId: data.studentId,
        teacherId: session.id,
        score: data.score,
        notes: data.notes,
        criteria: data.criteria,
      },
      include: {
        student: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
}
