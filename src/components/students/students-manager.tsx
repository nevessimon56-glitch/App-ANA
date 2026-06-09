"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HEALTH_CONDITIONS,
  getConditionLabel,
  parseHealthConditions,
} from "@/lib/health";
import { ArrowLeft, AlertTriangle } from "lucide-react";

type Student = {
  id: string;
  userId: string;
  notes?: string | null;
  healthConditions?: string | null;
  healthNotes?: string | null;
  user: { id: string; name: string; email: string; phone?: string | null };
  latestAssessment?: { score: number; createdAt: string } | null;
  appointmentCount: number;
  exerciseCount: number;
};

type Teacher = { id: string; name: string; email: string };

type TransferRecord = {
  id: string;
  studentUserId: string;
  transferredAt: string;
  reason?: string | null;
  canRecall: boolean;
  student: { id: string; name: string; email: string };
  toTeacher: { id: string; name: string };
};

export function StudentsManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [score, setScore] = useState("5");
  const [useCriteria, setUseCriteria] = useState(true);
  const [criteria, setCriteria] = useState({
    postura: 5,
    flexibilidade: 5,
    forca: 5,
    equilibrio: 5,
  });
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [healthNotes, setHealthNotes] = useState("");
  const [transferTeacherId, setTransferTeacherId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [studentsRes, teachersRes, transfersRes] = await Promise.all([
      fetch("/api/students"),
      fetch("/api/students/transfer"),
      fetch("/api/students/transfers"),
    ]);
    setStudents(await studentsRes.json());
    setTeachers(await teachersRes.json());
    setTransfers(await transfersRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  function selectStudent(student: Student) {
    setSelectedStudent(student);
    setMessage("");
    setError("");
    setHealthConditions(parseHealthConditions(student.healthConditions));
    setHealthNotes(student.healthNotes ?? "");
  }

  async function saveHealth() {
    if (!selectedStudent) return;
    setError("");

    const res = await fetch(`/api/students/${selectedStudent.userId}/health`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ healthConditions, healthNotes }),
    });

    if (!res.ok) {
      setError("Erro ao salvar anamnese");
      return;
    }

    setMessage("Ficha de saúde atualizada!");
    load();
  }

  function toggleCondition(id: string) {
    setHealthConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function saveAssessment() {
    if (!selectedStudent) return;
    setError("");

    const payload = useCriteria
      ? { studentId: selectedStudent.userId, criteria, notes: assessmentNotes }
      : {
          studentId: selectedStudent.userId,
          score: parseFloat(score),
          notes: assessmentNotes,
        };

    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Erro ao salvar avaliação");
      return;
    }

    setMessage("Avaliação registrada!");
    setAssessmentNotes("");
    load();
  }

  async function transferStudent() {
    if (!selectedStudent || !transferTeacherId) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/students/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudent.userId,
        toTeacherId: transferTeacherId,
        reason: transferReason,
      }),
    });

    setLoading(false);
    setShowTransferConfirm(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao transferir aluno");
      return;
    }

    const teacherName =
      teachers.find((t) => t.id === transferTeacherId)?.name ?? "outra professora";

    setMessage(
      `${selectedStudent.user.name} foi transferido(a) para ${teacherName}. O aluno saiu da sua lista, mas o histórico foi mantido. Você pode trazê-lo de volta abaixo, se precisar.`,
    );
    setSelectedStudent(null);
    setTransferTeacherId("");
    setTransferReason("");
    load();
  }

  async function recallStudent(studentId: string, studentName: string) {
    setError("");
    setLoading(true);

    const res = await fetch("/api/students/recall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao trazer aluno de volta");
      return;
    }

    setMessage(`${studentName} voltou para a sua lista de alunos!`);
    load();
  }

  const selectedTeacherName = teachers.find((t) => t.id === transferTeacherId)?.name;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-4">
          {students.map((student) => (
            <Card
              key={student.id}
              className={`cursor-pointer transition-colors ${
                selectedStudent?.id === student.id
                  ? "border-teal-300 ring-2 ring-teal-100"
                  : "hover:border-teal-100"
              }`}
              onClick={() => selectStudent(student)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{student.user.name}</h3>
                  <p className="text-sm text-slate-500">{student.user.email}</p>
                </div>
                {student.latestAssessment && (
                  <Badge variant="success">
                    Nota: {student.latestAssessment.score.toFixed(1)}/10
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex gap-4 text-sm text-slate-500">
                <span>{student.appointmentCount} aulas</span>
                <span>{student.exerciseCount} exercícios feitos</span>
              </div>

              {student.notes && (
                <p className="mt-2 text-sm text-slate-600">{student.notes}</p>
              )}
            </Card>
          ))}

          {students.length === 0 && (
            <Card className="py-12 text-center text-slate-500">
              <p>Nenhum aluno na sua lista no momento.</p>
              {transfers.length > 0 && (
                <p className="mt-2 text-sm">
                  Você transferiu aluno(s) recentemente — veja abaixo para trazer de volta.
                </p>
              )}
            </Card>
          )}
        </div>

        {transfers.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Alunos transferidos
            </h3>
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <Card key={transfer.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{transfer.student.name}</p>
                      <p className="text-sm text-slate-500">
                        Transferido para <strong>{transfer.toTeacher.name}</strong> em{" "}
                        {format(new Date(transfer.transferredAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      {transfer.reason && (
                        <p className="mt-1 text-xs text-slate-400">{transfer.reason}</p>
                      )}
                    </div>
                    {transfer.canRecall && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={loading}
                        onClick={() =>
                          recallStudent(transfer.studentUserId, transfer.student.name)
                        }
                      >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Trazer de volta
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {selectedStudent ? (
          <Card className="sticky top-6 space-y-5 lg:top-24">
            <h3 className="font-semibold text-slate-900">{selectedStudent.user.name}</h3>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Ficha de saúde (anamnese)</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_CONDITIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCondition(c.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      healthConditions.includes(c.id)
                        ? "border-teal-300 bg-teal-50 text-teal-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <Textarea
                className="mt-2"
                placeholder="Observações de saúde, lesões, medicamentos..."
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
              />
              <Button className="mt-2 w-full" size="sm" variant="secondary" onClick={saveHealth}>
                Salvar ficha de saúde
              </Button>
              {healthConditions.length > 0 && (
                <p className="mt-2 text-xs text-teal-700">
                  Alertas ativos:{" "}
                  {healthConditions.map((id) => getConditionLabel(id)).join(", ")}
                </p>
              )}
            </div>

            <hr className="border-teal-50" />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Nova avaliação</p>
                <button
                  type="button"
                  onClick={() => setUseCriteria(!useCriteria)}
                  className="text-xs text-teal-700 hover:underline"
                >
                  {useCriteria ? "Usar nota única" : "Usar critérios"}
                </button>
              </div>

              {useCriteria ? (
                <div className="space-y-3">
                  {(
                    [
                      ["postura", "Postura"],
                      ["flexibilidade", "Flexibilidade"],
                      ["forca", "Força"],
                      ["equilibrio", "Equilíbrio"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>{label}</span>
                        <span>{criteria[key]}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={criteria[key]}
                        onChange={(e) =>
                          setCriteria((prev) => ({
                            ...prev,
                            [key]: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-teal-700"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">
                    Nota média:{" "}
                    {(
                      (criteria.postura +
                        criteria.flexibilidade +
                        criteria.forca +
                        criteria.equilibrio) /
                      4
                    ).toFixed(1)}
                    /10
                  </p>
                </div>
              ) : (
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              )}

              <Textarea
                className="mt-2"
                placeholder="Observações da avaliação..."
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
              />
              <Button className="mt-2 w-full" size="sm" onClick={saveAssessment}>
                Salvar avaliação
              </Button>
            </div>

            <hr className="border-teal-50" />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Transferir para outra professora
              </p>
              <p className="mb-3 text-xs text-amber-700">
                O aluno sairá da sua lista e passará para a professora selecionada. O
                histórico de avaliações e exercícios é mantido.
              </p>
              {teachers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Não há outra professora cadastrada no sistema.
                </p>
              ) : (
                <>
                  <select
                    value={transferTeacherId}
                    onChange={(e) => setTransferTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    className="mt-2"
                    placeholder="Motivo da transferência..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                  />
                  <Button
                    className="mt-2 w-full"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowTransferConfirm(true)}
                    disabled={!transferTeacherId || loading}
                  >
                    Transferir aluno
                  </Button>
                </>
              )}
            </div>

            {message && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
          </Card>
        ) : (
          <Card className="py-12 text-center text-sm text-slate-500">
            {message ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">{message}</p>
            ) : (
              "Selecione um aluno para avaliar ou transferir"
            )}
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-red-700">{error}</p>
            )}
          </Card>
        )}
      </div>

      {showTransferConfirm && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <Card className="w-full max-w-md p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Confirmar transferência</h3>
                <p className="mt-2 text-sm text-slate-600">
                  <strong>{selectedStudent.user.name}</strong> será transferido(a) para{" "}
                  <strong>{selectedTeacherName}</strong> e <strong>sairá da sua lista</strong>.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  O histórico de avaliações e exercícios será mantido. Você poderá trazê-lo de
                  volta depois, se precisar.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="danger"
                disabled={loading}
                onClick={transferStudent}
              >
                {loading ? "Transferindo..." : "Sim, transferir"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowTransferConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
