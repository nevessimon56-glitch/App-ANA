import { PageHeader } from "@/components/layout/page-header";
import { ExerciseForm } from "@/components/forms/exercise-form";

export default function NewExercisePage() {
  return (
    <div>
      <PageHeader
        title="Novo Exercício"
        description="Cadastre um exercício com vídeo, dificuldade e contraindicações"
      />
      <ExerciseForm />
    </div>
  );
}
