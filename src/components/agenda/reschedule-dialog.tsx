"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { isoToDatetimeLocal, datetimeLocalToIso } from "@/lib/dates";
import { X } from "lucide-react";

export function RescheduleDialog({
  open,
  currentDateIso,
  onClose,
  onConfirm,
}: {
  open: boolean;
  currentDateIso: string;
  onClose: () => void;
  onConfirm: (newDateIso: string) => Promise<void>;
}) {
  const [value, setValue] = useState(() => isoToDatetimeLocal(currentDateIso));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const iso = datetimeLocalToIso(value);
      if (!iso || Number.isNaN(new Date(iso).getTime())) {
        setError("Data ou hora inválida");
        return;
      }
      await onConfirm(iso);
      onClose();
    } catch {
      setError("Não foi possível remarcar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <Card className="w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Remarcar aula</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nova data e hora
            </label>
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Salvando..." : "Confirmar"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
