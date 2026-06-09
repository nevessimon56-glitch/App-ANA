"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type Lesson = {
  id: string;
  name: string;
  description?: string | null;
  exercises: { id: string; order: number; exercise: { name: string } }[];
};

export function LessonsList({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();
  const [cloning, setCloning] = useState<string | null>(null);

  async function cloneLesson(lesson: Lesson) {
    setCloning(lesson.id);
    const res = await fetch(`/api/lessons/${lesson.id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setCloning(null);

    if (res.ok) {
      router.refresh();
    }
  }

  if (lessons.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-slate-500">Nenhuma aula montada ainda.</p>
        <Link href="/professora/aulas/nova" className="mt-4 inline-block">
          <Button>Montar primeira aula</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {lessons.map((lesson) => (
        <Card key={lesson.id}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{lesson.name}</h3>
            <Button
              size="sm"
              variant="ghost"
              disabled={cloning === lesson.id}
              onClick={() => cloneLesson(lesson)}
              title="Clonar aula"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
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
  );
}
