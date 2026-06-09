/**
 * Converte valor de input datetime-local (horário local do navegador) para ISO UTC.
 * Evita bug em que o servidor (UTC) interpreta "2026-06-10T09:00" como 9h UTC em vez de 9h local.
 */
export function datetimeLocalToIso(value: string): string {
  if (!value) return value;

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString();
}

export function isoToDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function weekRangeIso(reference: Date) {
  const start = new Date(reference);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { from: start.toISOString(), to: end.toISOString() };
}
