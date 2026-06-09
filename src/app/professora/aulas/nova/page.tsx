import { PageHeader } from "@/components/layout/page-header";
import { LessonForm } from "@/components/forms/lesson-form";

export default function NewLessonPage() {
  return (
    <div>
      <PageHeader
        title="Nova Aula"
        description="Selecione exercícios e defina a sequência da aula"
      />
      <LessonForm />
    </div>
  );
}
