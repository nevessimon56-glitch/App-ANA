import { PageHeader } from "@/components/layout/page-header";
import { ProgressView } from "@/components/student/progress-view";

export default function StudentProgressPage() {
  return (
    <div>
      <PageHeader
        title="Meu Progresso"
        description="Veja sua evolução, exercícios realizados e histórico de avaliações"
      />
      <ProgressView />
    </div>
  );
}
