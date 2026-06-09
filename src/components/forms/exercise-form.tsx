"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

type ExerciseFormProps = {
  initial?: {
    id?: string;
    name: string;
    description?: string | null;
    videoUrl?: string | null;
    difficulty: string;
    muscles: string[];
    contraindications?: string | null;
    benefits?: string | null;
  };
};

export function ExerciseForm({ initial }: ExerciseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [muscles, setMuscles] = useState(initial?.muscles.join(", ") ?? "");

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setVideoUrl(data.url);
    } else {
      setError(data.error ?? "Erro no upload");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      videoUrl: videoUrl || undefined,
      difficulty: form.get("difficulty"),
      muscles: muscles
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      contraindications: form.get("contraindications"),
      benefits: form.get("benefits"),
    };

    const url = initial?.id
      ? `/api/exercises/${initial.id}`
      : "/api/exercises";
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

    router.push("/professora/exercicios");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nome do exercício *
          </label>
          <Input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Ex: The Hundred"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Descrição
          </label>
          <Textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Como executar o exercício..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Vídeo ou imagem
          </label>
          <Input
            type="file"
            accept="video/*,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          {uploading && (
            <p className="mt-1 text-sm text-teal-600">Enviando arquivo...</p>
          )}
          {videoUrl && (
            <p className="mt-1 text-sm text-emerald-600">✓ Arquivo enviado</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nível de dificuldade *
          </label>
          <select
            name="difficulty"
            defaultValue={initial?.difficulty ?? "INICIANTE"}
            className="w-full rounded-xl border border-teal-100 bg-white px-4 py-2.5 text-sm"
          >
            <option value="INICIANTE">Iniciante</option>
            <option value="INTERMEDIARIO">Intermediário</option>
            <option value="AVANCADO">Avançado</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Musculatura trabalhada * (separar por vírgula)
          </label>
          <Input
            value={muscles}
            onChange={(e) => setMuscles(e.target.value)}
            placeholder="abdômen, core, glúteos"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            O que este exercício trabalha
          </label>
          <Textarea
            name="benefits"
            defaultValue={initial?.benefits ?? ""}
            placeholder="Fortalece o core, melhora postura..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Quem NÃO pode fazer (contraindicações)
          </label>
          <Textarea
            name="contraindications"
            defaultValue={initial?.contraindications ?? ""}
            placeholder="Gestantes, hérnia de disco, dor lombar aguda..."
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar exercício"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
