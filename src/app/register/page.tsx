"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"TEACHER" | "STUDENT">("TEACHER");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        phone: form.get("phone"),
        role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao cadastrar");
      return;
    }

    router.push(data.user.role === "TEACHER" ? "/professora" : "/aluno");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4 py-10">
      <Card className="w-full max-w-md">
        <CardTitle>Criar conta</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre-se como professora ou aluno
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`rounded-lg py-2 text-sm font-medium ${
                role === "TEACHER"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Professora
            </button>
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`rounded-lg py-2 text-sm font-medium ${
                role === "STUDENT"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Aluno
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome
            </label>
            <Input name="name" required placeholder="Seu nome" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <Input name="email" type="email" required placeholder="seu@email.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Telefone
            </label>
            <Input name="phone" placeholder="(11) 99999-0000" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <Input name="password" type="password" required minLength={6} />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
