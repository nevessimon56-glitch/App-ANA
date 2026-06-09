"use client";

type Assessment = {
  score: number;
  createdAt: string;
  criteria?: string | null;
};

const CRITERIA_LABELS: Record<string, string> = {
  postura: "Postura",
  flexibilidade: "Flexibilidade",
  forca: "Força",
  equilibrio: "Equilíbrio",
};

export function ProgressChart({ assessments }: { assessments: Assessment[] }) {
  if (assessments.length === 0) return null;

  const latest = assessments[assessments.length - 1];
  let criteria: Record<string, number> | null = null;

  if (latest.criteria) {
    try {
      criteria = JSON.parse(latest.criteria);
    } catch {
      criteria = null;
    }
  }

  const maxScore = Math.max(...assessments.map((a) => a.score), 10);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Evolução da nota</p>
        <div className="flex h-32 items-end gap-2">
          {assessments.map((a, i) => {
            const height = (a.score / maxScore) * 100;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-teal-700">
                  {a.score.toFixed(1)}
                </span>
                <div
                  className="w-full rounded-t-lg bg-teal-500 transition-all"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {criteria && (
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Última avaliação por critério</p>
          <div className="space-y-2">
            {Object.entries(criteria).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-xs text-slate-600">
                  <span>{CRITERIA_LABELS[key] ?? key}</span>
                  <span>{value}/10</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
