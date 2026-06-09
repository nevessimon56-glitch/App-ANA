"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  id: string;
  userId: string;
  notes?: string | null;
  user: { id: string; name: string; email: string; phone?: string | null };
  latestAssessment?: { score: number; createdAt: string } | null;
  appointmentCount: number;
  exerciseCount: number;
};

type Teacher = { id: string; name: string; email: string };

export function StudentsManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [score, setScore] = useState("5");
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [transferTeacherId, setTransferTeacherId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [studentsRes, teachersRes] = await Promise.all([
      fetch("/api/students"),
      fetch("/api/students/transfer"),
    ]);
    setStudents(await studentsRes.json());
    setTeachers(await teachersRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function saveAssessment() {
    if (!selectedStudent) return;

    await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudent.userId,
        score: parseFloat(score),
        notes: assessmentNotes,
      }),
    });

    setMessage("Avaliação registrada!");
    setAssessmentNotes("");
    load();
  }

  async function transferStudent() {
    if (!selectedStudent || !transferTeacherId) return;

    await fetch("/api/students/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudent.userId,
        toTeacherId: transferTeacherId,
        reason: transferReason,
      }),
    });

    setMessage("Aluno transferido com sucesso!");
    setSelectedStudent(null);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {students.map((student) => (
          <Card
            key={student.id}
            className={`cursor-pointer transition-colors ${
              selectedStudent?.id === student.id
                ? "border-teal-300 ring-2 ring-teal-100"
                : "hover:border-teal-100"
            }`}
            onClick={() => setSelectedStudent(student)}
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
            Nenhum aluno cadastrado ainda.
          </Card>
        )}
      </div>

      <div>
        {selectedStudent ? (
          <Card className="sticky top-6 space-y-5">
            <h3 className="font-semibold text-slate-900">
              {selectedStudent.user.name}
            </h3>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Nova avaliação (0 a 10)
              </p>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
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
                onClick={transferStudent}
                disabled={!transferTeacherId}
              >
                Transferir aluno
              </Button>
            </div>

            {message && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </p>
            )}
          </Card>
        ) : (
          <Card className="py-12 text-center text-sm text-slate-500">
            Selecione um aluno para avaliar ou transferir
          </Card>
        )}
      </div>
    </div>
  );
}
