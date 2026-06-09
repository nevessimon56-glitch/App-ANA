import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);

    if (data.role === "STUDENT") {
      const teacher = await prisma.user.findFirst({
        where: { role: "TEACHER" },
      });
      if (!teacher) {
        return NextResponse.json(
          { error: "Nenhuma professora cadastrada no sistema" },
          { status: 400 },
        );
      }

      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: "STUDENT",
          phone: data.phone,
          studentProfile: { create: { teacherId: teacher.id } },
        },
      });

      await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return NextResponse.json({ user }, { status: 201 });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: "TEACHER",
        phone: data.phone,
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 500 });
  }
}
