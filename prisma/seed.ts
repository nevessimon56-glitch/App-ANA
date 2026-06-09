import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "ana@pilates.com" },
    update: {},
    create: {
      email: "ana@pilates.com",
      passwordHash,
      name: "Ana Professora",
      role: "TEACHER",
      phone: "(11) 99999-0000",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "maria@pilates.com" },
    update: {},
    create: {
      email: "maria@pilates.com",
      passwordHash,
      name: "Maria Professora",
      role: "TEACHER",
      phone: "(11) 98888-0000",
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "aluno@pilates.com" },
    update: {},
    create: {
      email: "aluno@pilates.com",
      passwordHash,
      name: "João Aluno",
      role: "STUDENT",
      phone: "(11) 97777-0000",
      studentProfile: {
        create: {
          teacherId: teacher.id,
          notes: "Iniciante em pilates, foco em core e postura.",
        },
      },
    },
  });

  const exercises = await Promise.all([
    prisma.exercise.upsert({
      where: { id: "seed-ex-1" },
      update: {},
      create: {
        id: "seed-ex-1",
        name: "The Hundred",
        description: "Exercício clássico de aquecimento abdominal.",
        difficulty: "INICIANTE",
        muscles: JSON.stringify(["abdômen", "core", "respiração"]),
        benefits: "Fortalece o core e melhora a respiração.",
        contraindications: "Gestantes no 2º/3º trimestre, hérnia de disco aguda.",
        teacherId: teacher.id,
      },
    }),
    prisma.exercise.upsert({
      where: { id: "seed-ex-2" },
      update: {},
      create: {
        id: "seed-ex-2",
        name: "Roll Up",
        description: "Articulação da coluna vertebral.",
        difficulty: "INTERMEDIARIO",
        muscles: JSON.stringify(["abdômen", "flexores de quadril", "coluna"]),
        benefits: "Mobilidade da coluna e fortalecimento abdominal.",
        contraindications: "Osteoporose avançada, dor lombar aguda.",
        teacherId: teacher.id,
      },
    }),
    prisma.exercise.upsert({
      where: { id: "seed-ex-3" },
      update: {},
      create: {
        id: "seed-ex-3",
        name: "Swan",
        description: "Extensão da coluna no trapézio ou solo.",
        difficulty: "INTERMEDIARIO",
        muscles: JSON.stringify(["extensores da coluna", "glúteos", "ombros"]),
        benefits: "Fortalece extensores e melhora postura.",
        contraindications: "Hérnia discal, gestação avançada.",
        teacherId: teacher.id,
      },
    }),
    prisma.exercise.upsert({
      where: { id: "seed-ex-4" },
      update: {},
      create: {
        id: "seed-ex-4",
        name: "Teaser",
        description: "Equilíbrio e controle em V.",
        difficulty: "AVANCADO",
        muscles: JSON.stringify(["abdômen", "flexores de quadril", "equilíbrio"]),
        benefits: "Controle total do core e equilíbrio.",
        contraindications: "Lesões lombares, início de prática.",
        teacherId: teacher.id,
      },
    }),
  ]);

  const lesson = await prisma.lesson.upsert({
    where: { id: "seed-lesson-1" },
    update: {},
    create: {
      id: "seed-lesson-1",
      name: "Aula Iniciante - Core",
      description: "Sequência básica para fortalecimento do core.",
      teacherId: teacher.id,
      exercises: {
        create: exercises.slice(0, 3).map((ex, i) => ({
          exerciseId: ex.id,
          order: i + 1,
        })),
      },
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await prisma.appointment.upsert({
    where: { id: "seed-appt-1" },
    update: {},
    create: {
      id: "seed-appt-1",
      teacherId: teacher.id,
      studentId: studentUser.id,
      lessonId: lesson.id,
      scheduledAt: tomorrow,
      status: "AGENDADA",
      notes: "Primeira aula da semana",
    },
  });

  await prisma.assessment.upsert({
    where: { id: "seed-assess-1" },
    update: {},
    create: {
      id: "seed-assess-1",
      studentId: studentUser.id,
      teacherId: teacher.id,
      score: 3.5,
      notes: "Boa postura inicial. Precisa trabalhar flexibilidade lombar.",
      criteria: JSON.stringify({
        postura: 4,
        flexibilidade: 2,
        forca: 4,
        equilibrio: 4,
      }),
    },
  });

  console.log("Seed concluído!");
  console.log("Professora: ana@pilates.com / 123456");
  console.log("Aluno: aluno@pilates.com / 123456");
  console.log("Professora substituta: maria@pilates.com / 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
