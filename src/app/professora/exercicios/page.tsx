import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS, parseJsonArray } from "@/lib/utils";

export default async function ExercisesPage() {
  const session = await getSession();
  if (!session) return null;

  const exercises = await prisma.exercise.findMany({
    where: { teacherId: session.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Biblioteca de Exercícios"
        description="Cadastre todos os seus exercícios com vídeo, dificuldade e contraindicações"
        action={
          <Link href="/professora/exercicios/novo">
            <Button>Novo exercício</Button>
          </Link>
        }
      />

      {exercises.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-500">Nenhum exercício cadastrado ainda.</p>
          <Link href="/professora/exercicios/novo" className="mt-4 inline-block">
            <Button>Cadastrar primeiro exercício</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="flex flex-col">
              {exercise.videoUrl ? (
                exercise.videoUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    src={exercise.videoUrl}
                    className="mb-4 h-40 w-full rounded-xl bg-slate-100 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={exercise.videoUrl}
                    alt={exercise.name}
                    className="mb-4 h-40 w-full rounded-xl bg-slate-100 object-cover"
                  />
                )
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-teal-50 text-sm text-teal-600">
                  Sem vídeo
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                  <Badge>
                    {DIFFICULTY_LABELS[exercise.difficulty]}
                  </Badge>
                </div>

                {exercise.benefits && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {exercise.benefits}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {parseJsonArray(exercise.muscles).map((muscle) => (
                    <Badge key={muscle} variant="muted">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                {exercise.contraindications && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                    ⚠ {exercise.contraindications}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
