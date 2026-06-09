import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

      {lessons.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-slate-500">Nenhuma aula montada ainda.</p>
          <Link href="/professora/aulas/nova" className="mt-4 inline-block">
            <Button>Montar primeira aula</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <h3 className="text-lg font-semibold text-slate-900">{lesson.name}</h3>
              {lesson.description && (
                <p className="mt-1 text-sm text-slate-500">{lesson.description}</p>
              )}

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal-600">
                Sequência ({lesson.exercises.length} exercícios)
              </p>
              <ol className="mt-2 space-y-1.5">
                {lesson.exercises.map((le) => (
                  <li
                    key={le.id}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                      {le.order}
                    </span>
                    {le.exercise.name}
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
