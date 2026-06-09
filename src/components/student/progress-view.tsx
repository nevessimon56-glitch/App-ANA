"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/lib/utils";
import { TrendingUp, Dumbbell, Calendar, AlertCircle } from "lucide-react";

type ProgressData = {
  stats: {
    totalClasses: number;
    missedClasses: number;
    upcomingClasses: number;
    totalExercises: number;
    currentScore: number;
    initialScore: number;
  };
  assessments: {
    id: string;
    score: number;
    notes?: string | null;
    createdAt: string;
    teacher: { name: string };
  }[];
  exerciseLogs: {
    id: string;
    completedAt: string;
    exercise: { name: string; difficulty: string };
  }[];
  appointments: {
    id: string;
    scheduledAt: string;
    status: string;
    lesson?: { name: string } | null;
    teacher: { name: string };
  }[];
  profile?: {
    teacher: { name: string };
  } | null;
};

export function ProgressView() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetch("/api/student/progress")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <p className="text-slate-500">Carregando progresso...</p>;
  }

  const { stats, assessments, exerciseLogs, appointments, profile } = data;
  const evolution = stats.currentScore - stats.initialScore;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold">{stats.currentScore.toFixed(1)}</p>
              <p className="text-sm text-slate-500">Nota atual / 10</p>
              {evolution !== 0 && (
                <p
                  className={`text-xs ${evolution > 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {evolution > 0 ? "+" : ""}
                  {evolution.toFixed(1)} desde o início
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalClasses}</p>
              <p className="text-sm text-slate-500">Aulas realizadas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalExercises}</p>
              <p className="text-sm text-slate-500">Exercícios feitos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{stats.missedClasses}</p>
              <p className="text-sm text-slate-500">Faltas registradas</p>
            </div>
          </div>
        </Card>
      </div>

      {profile?.teacher && (
        <Card>
          <p className="text-sm text-slate-500">
            Professora: <strong>{profile.teacher.name}</strong>
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>Histórico de Avaliações</CardTitle>
        {assessments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between rounded-xl border border-teal-50 p-3"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    Nota: {a.score.toFixed(1)}/10
                  </p>
                  {a.notes && (
                    <p className="mt-1 text-sm text-slate-500">{a.notes}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {a.teacher.name} —{" "}
                    {format(new Date(a.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Exercícios Realizados</CardTitle>
        {exerciseLogs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhum exercício registrado.</p>
        ) : (
          <ul className="mt-4 divide-y divide-teal-50">
            {exerciseLogs.slice(0, 20).map((log) => (
              <li key={log.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800">{log.exercise.name}</p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(log.completedAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <Badge variant="muted">
                  {DIFFICULTY_LABELS[log.exercise.difficulty]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Histórico de Aulas</CardTitle>
        <ul className="mt-4 divide-y divide-teal-50">
          {appointments.map((appt) => (
            <li key={appt.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-800">
                  {appt.lesson?.name ?? "Aula personalizada"}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(appt.scheduledAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}{" "}
                  — {appt.teacher.name}
                </p>
              </div>
              <Badge
                variant={
                  appt.status === "REALIZADA"
                    ? "success"
                    : appt.status === "FALTA"
                      ? "danger"
                      : "default"
                }
              >
                {STATUS_LABELS[appt.status]}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
