"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao entrar");
      return;
    }

    router.push(data.user.role === "TEACHER" ? "/professora" : "/aluno");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardTitle>Entrar no {APP_NAME}</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Acesse sua conta de professora ou aluno
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <Input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              defaultValue="ana@pilates.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••"
              defaultValue="123456"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-teal-700 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
