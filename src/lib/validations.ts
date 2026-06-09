import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["TEACHER", "STUDENT"]),
  phone: z.string().optional(),
});

export const exerciseSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  difficulty: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  muscles: z.array(z.string()).min(1, "Informe ao menos uma musculatura"),
  contraindications: z.string().optional(),
  benefits: z.string().optional(),
});

export const lessonSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  exerciseIds: z.array(z.string()).min(1, "Selecione ao menos um exercício"),
});

export const appointmentSchema = z.object({
  studentId: z.string(),
  lessonId: z.string().optional(),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().min(15).max(180).optional(),
  notes: z.string().optional(),
});

export const assessmentSchema = z.object({
  studentId: z.string(),
  score: z.number().min(0).max(10),
  notes: z.string().optional(),
  criteria: z.string().optional(),
});

export const transferSchema = z.object({
  studentId: z.string(),
  toTeacherId: z.string(),
  reason: z.string().optional(),
});
