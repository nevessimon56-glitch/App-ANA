import { parseJsonArray, toJsonArray } from "@/lib/utils";

export const HEALTH_CONDITIONS = [
  { id: "gestante", label: "Gestante" },
  { id: "hernia-disco", label: "Hérnia de disco" },
  { id: "osteoporose", label: "Osteoporose" },
  { id: "dor-lombar", label: "Dor lombar" },
  { id: "hipertensao", label: "Hipertensão" },
  { id: "problema-cervical", label: "Problema cervical" },
  { id: "pos-operatorio", label: "Pós-operatório recente" },
  { id: "iniciante", label: "Iniciante absoluto" },
] as const;

export type HealthConditionId = (typeof HEALTH_CONDITIONS)[number]["id"];

export function parseHealthConditions(value: string | null | undefined): string[] {
  if (!value) return [];
  return parseJsonArray(value);
}

export function healthConditionsToJson(conditions: string[]): string {
  return toJsonArray(conditions);
}

export function getConditionLabel(id: string): string {
  return HEALTH_CONDITIONS.find((c) => c.id === id)?.label ?? id;
}

/** Verifica se exercício pode ter risco para as condições do aluno */
export function checkContraindications(
  contraindications: string | null | undefined,
  studentConditions: string[],
): { hasWarning: boolean; warnings: string[] } {
  if (!contraindications || studentConditions.length === 0) {
    return { hasWarning: false, warnings: [] };
  }

  const text = contraindications.toLowerCase();
  const warnings: string[] = [];

  for (const conditionId of studentConditions) {
    const label = getConditionLabel(conditionId).toLowerCase();
    const keywords: Record<string, string[]> = {
      gestante: ["gestante", "gestação", "gravidez"],
      "hernia-disco": ["hérnia", "hernia", "disco"],
      osteoporose: ["osteoporose"],
      "dor-lombar": ["lombar", "coluna lombar"],
      hipertensao: ["hipertensão", "pressão"],
      "problema-cervical": ["cervical", "pescoço"],
      "pos-operatorio": ["pós-operatório", "cirurgia", "operatório"],
      iniciante: ["início de prática", "iniciante"],
    };

    const terms = keywords[conditionId] ?? [label];
    if (terms.some((term) => text.includes(term))) {
      warnings.push(getConditionLabel(conditionId));
    }
  }

  return { hasWarning: warnings.length > 0, warnings };
}
