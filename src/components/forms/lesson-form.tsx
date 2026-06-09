"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/lib/utils";
import { GripVertical } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  difficulty: string;
};

export function LessonForm({
  initial,
}: {
  initial?: { id: string; name: string; description?: string | null; exerciseIds: string[] };
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<string[]>(initial?.exerciseIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then(setExercises);
  }, []);

  function toggleExercise(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelected((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setSelected((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Selecione ao menos um exercício");
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      exerciseIds: selected,
    };

    const url = initial?.id ? `/api/lessons/${initial.id}` : "/api/lessons";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
      return;
    }

    router.push("/professora/aulas");
    router.refresh();
  }

  const selectedExercises = selected
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome da aula *
            </label>
            <Input
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="Ex: Aula Iniciante - Core"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Descrição
            </label>
            <Textarea
              name="description"
              defaultValue={initial?.description ?? ""}
              placeholder="Objetivo desta sequência..."
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Sequência ({selected.length} exercícios)
            </p>
            {selectedExercises.length === 0 ? (
              <p className="text-sm text-slate-500">
                Selecione exercícios ao lado para montar a sequência
              </p>
            ) : (
              <ol className="space-y-2">
                {selectedExercises.map((ex, index) => (
                  <li
                    key={ex.id}
                    className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2"
                  >
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{ex.name}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        className="rounded px-1.5 text-xs text-slate-500 hover:bg-white"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        className="rounded px-1.5 text-xs text-slate-500 hover:bg-white"
                      >
                        ↓
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar aula"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <p className="mb-4 text-sm font-medium text-slate-700">
          Selecionar exercícios
        </p>
        <div className="max-h-[500px] space-y-2 overflow-y-auto">
          {exercises.map((ex) => {
            const isSelected = selected.includes(ex.id);
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleExercise(ex.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-teal-300 bg-teal-50"
                    : "border-slate-100 hover:border-teal-100"
                }`}
              >
                <span className="text-sm font-medium text-slate-800">{ex.name}</span>
                <Badge variant={isSelected ? "success" : "muted"}>
                  {DIFFICULTY_LABELS[ex.difficulty]}
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
