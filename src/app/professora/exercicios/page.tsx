import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExercisesGrid } from "@/components/exercises/exercises-grid";

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
        <Card className="py-12 text-center">
          <p className="text-slate-500">Nenhum exercício cadastrado ainda.</p>
          <Link href="/professora/exercicios/novo" className="mt-4 inline-block">
            <Button>Cadastrar primeiro exercício</Button>
          </Link>
        </Card>
      ) : (
        <ExercisesGrid exercises={exercises} />
      )}
    </div>
  );
}
