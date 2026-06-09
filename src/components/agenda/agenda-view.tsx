"use client";

import { useEffect, useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS } from "@/lib/utils";
import { datetimeLocalToIso, weekRangeIso } from "@/lib/dates";
import { RescheduleDialog } from "@/components/agenda/reschedule-dialog";
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

const UPCOMING_STATUSES = ["AGENDADA", "REMARCADA"];

export function AgendaView({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  const { from, to } = weekRangeIso(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(from);
    return addDays(start, i);
  });

  async function loadData() {
    setLoading(true);
    setError("");

    const [apptRes, studentsRes, lessonsRes] = await Promise.all([
      fetch(`/api/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      role === "TEACHER" ? fetch("/api/students") : Promise.resolve(null),
      role === "TEACHER" ? fetch("/api/lessons") : Promise.resolve(null),
    ]);

    if (!apptRes.ok) {
      setError("Erro ao carregar agenda");
      setLoading(false);
      return;
    }

    const apptData = await apptRes.json();
    setAppointments(Array.isArray(apptData) ? apptData : []);
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
    setError("");

    const form = new FormData(e.currentTarget);
    const scheduledAtRaw = String(form.get("scheduledAt") ?? "");
    const lessonId = String(form.get("lessonId") ?? "");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: form.get("studentId"),
        lessonId: lessonId || undefined,
        scheduledAt: datetimeLocalToIso(scheduledAtRaw),
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao agendar aula");
      return;
    }

    const created = await res.json();
    setShowForm(false);
    e.currentTarget.reset();

    // Ir para a semana da aula agendada
    if (created.scheduledAt) {
      setCurrentDate(new Date(created.scheduledAt));
    } else {
      loadData();
    }
  }

  async function updateAppointment(
    id: string,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Erro ao atualizar aula");
      return false;
    }

    const updated = await res.json();
    const newDate = updated.scheduledAt ?? updated.appointment?.scheduledAt;
    if (newDate) {
      setCurrentDate(new Date(newDate));
    } else {
      loadData();
    }
    return true;
  }

  async function handleReschedule(newDateIso: string) {
    if (!rescheduleTarget) return;
    await updateAppointment(rescheduleTarget.id, {
      reschedule: true,
      scheduledAt: newDateIso,
    });
    setRescheduleTarget(null);
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

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

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
              <Card key={day.toISOString()} className="min-h-[120px] p-3 sm:min-h-[200px]">
                <p className="mb-3 text-center text-sm font-semibold text-slate-700">
                  {format(day, "EEE", { locale: ptBR })}
                  <br />
                  <span className="text-lg">{format(day, "d")}</span>
                </p>

                <div className="space-y-2">
                  {dayAppts.length === 0 && (
                    <p className="text-center text-xs text-slate-400">Sem aulas</p>
                  )}
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
                        {role === "TEACHER" && UPCOMING_STATUSES.includes(appt.status) && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateAppointment(appt.id, { completeSession: true })
                              }
                              className="rounded bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200"
                              title="Marcar como realizada"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateAppointment(appt.id, { status: "FALTA" })
                              }
                              className="rounded bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
                              title="Registrar falta"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {UPCOMING_STATUSES.includes(appt.status) && (
                          <button
                            type="button"
                            onClick={() => setRescheduleTarget(appt)}
                            className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
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

      <RescheduleDialog
        open={!!rescheduleTarget}
        currentDateIso={rescheduleTarget?.scheduledAt ?? new Date().toISOString()}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleReschedule}
      />
    </div>
  );
}
