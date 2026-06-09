import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { LessonsList } from "@/components/lessons/lessons-list";

export default async function LessonsPage() {
  const session = await getSession();
  if (!session) return null;

  const lessons = await prisma.lesson.findMany({
    where: { teacherId: session.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Aulas e Sequências"
        description="Monte aulas selecionando exercícios da sua biblioteca"
        action={
          <Link href="/professora/aulas/nova">
            <Button>Nova aula</Button>
          </Link>
        }
      />

      <LessonsList lessons={lessons} />
    </div>
  );
}
