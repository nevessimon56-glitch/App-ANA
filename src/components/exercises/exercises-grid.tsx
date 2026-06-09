"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DIFFICULTY_LABELS, parseJsonArray } from "@/lib/utils";
import { Search } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  description?: string | null;
  videoUrl?: string | null;
  difficulty: string;
  muscles: string;
  contraindications?: string | null;
  benefits?: string | null;
};

export function ExercisesGrid({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const muscles = parseJsonArray(ex.muscles).join(" ").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        muscles.includes(q) ||
        (ex.benefits?.toLowerCase().includes(q) ?? false);

      const matchesDifficulty = !difficulty || ex.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [exercises, search, difficulty]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por nome ou musculatura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-teal-100 px-4 py-2.5 text-sm"
        >
          <option value="">Todas dificuldades</option>
          <option value="INICIANTE">Iniciante</option>
          <option value="INTERMEDIARIO">Intermediário</option>
          <option value="AVANCADO">Avançado</option>
        </select>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {filtered.length} exercício(s) encontrado(s)
      </p>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center text-slate-500">
          Nenhum exercício encontrado com esses filtros.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
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
                  <Badge>{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
                </div>

                {exercise.benefits && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
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
                  <p className="mt-3 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
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
