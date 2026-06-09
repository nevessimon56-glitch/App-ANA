"use client";

import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  notes?: string | null;
  student: { id: string; name: string };
  lesson?: {
    id: string;
    name: string;
    exercises: { exercise: { id: string; name: string }; order: number }[];
  } | null;
};

type Student = { user: { id: string; name: string } };
type Lesson = { id: string; name: string };

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  AGENDADA: "default",
  REALIZADA: "success",
  FALTA: "danger",
  REMARCADA: "warning",
  CANCELADA: "muted",
};

export function AgendaView({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function loadData() {
    setLoading(true);
    const from = weekStart.toISOString();
    const to = weekEnd.toISOString();

    const [apptRes, studentsRes, lessonsRes] = await Promise.all([
      fetch(`/api/appointments?from=${from}&to=${to}`),
      role === "TEACHER" ? fetch("/api/students") : Promise.resolve(null),
      role === "TEACHER" ? fetch("/api/lessons") : Promise.resolve(null),
    ]);

    setAppointments(await apptRes.json());
    if (studentsRes) setStudents(await studentsRes.json());
    if (lessonsRes) setLessons(await lessonsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, role]);

  async function createAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: form.get("studentId"),
        lessonId: form.get("lessonId") || undefined,
        scheduledAt: form.get("scheduledAt"),
        notes: form.get("notes"),
      }),
    });

    setShowForm(false);
    loadData();
  }

  async function updateAppointment(
    id: string,
    data: Record<string, unknown>,
  ) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadData();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold capitalize text-slate-800 sm:text-lg">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {role === "TEACHER" && (
          <Button className="w-full sm:w-auto" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Agendar aula"}
          </Button>
        )}
      </div>

      {showForm && role === "TEACHER" && (
        <Card className="mb-6">
          <form onSubmit={createAppointment} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Aluno</label>
              <select
                name="studentId"
                required
                className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {students.map((s) => (
                  <option key={s.user.id} value={s.user.id}>
                    {s.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Aula / Sequência</label>
              <select
                name="lessonId"
                className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm"
              >
                <option value="">Sem sequência definida</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Data e hora</label>
              <Input name="scheduledAt" type="datetime-local" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Observações</label>
              <Input name="notes" placeholder="Notas da aula..." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Salvar agendamento</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-slate-500">Carregando agenda...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((day) => {
            const dayAppts = appointments.filter((a) =>
              isSameDay(new Date(a.scheduledAt), day),
            );

            return (
              <Card key={day.toISOString()} className="min-h-[200px] p-3">
                <p className="mb-3 text-center text-sm font-semibold text-slate-700">
                  {format(day, "EEE", { locale: ptBR })}
                  <br />
                  <span className="text-lg">{format(day, "d")}</span>
                </p>

                <div className="space-y-2">
                  {dayAppts.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-lg border border-teal-50 bg-teal-50/50 p-2"
                    >
                      <p className="text-xs font-bold text-teal-800">
                        {format(new Date(appt.scheduledAt), "HH:mm")}
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {role === "TEACHER" ? appt.student.name : "Sua aula"}
                      </p>
                      {appt.lesson && (
                        <p className="text-xs text-slate-500">{appt.lesson.name}</p>
                      )}
                      <Badge
                        variant={statusVariant[appt.status] ?? "muted"}
                        className="mt-1"
                      >
                        {STATUS_LABELS[appt.status]}
                      </Badge>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {role === "TEACHER" && appt.status === "AGENDADA" && (
                          <>
                            <button
                              onClick={() =>
                                updateAppointment(appt.id, { completeSession: true })
                              }
                              className="rounded bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200"
                              title="Marcar como realizada"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() =>
                                updateAppointment(appt.id, { status: "FALTA" })
                              }
                              className="rounded bg-red-100 p-1 text-red-700 hover:bg-red-200"
                              title="Registrar falta"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        {(appt.status === "AGENDADA" || appt.status === "REMARCADA") && (
                          <button
                            onClick={() => {
                              const newDate = prompt(
                                "Nova data e hora (AAAA-MM-DDTHH:MM):",
                                format(new Date(appt.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
                              );
                              if (newDate) {
                                updateAppointment(appt.id, {
                                  status: "REMARCADA",
                                  scheduledAt: newDate,
                                });
                              }
                            }}
                            className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 hover:bg-amber-200"
                          >
                            Remarcar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
