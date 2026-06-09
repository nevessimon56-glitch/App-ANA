import { PageHeader } from "@/components/layout/page-header";
import { StudentsManager } from "@/components/students/students-manager";

export default function StudentsPage() {
  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Avalie alunos de 0 a 10, acompanhe o progresso e transfira para outra professora"
      />
      <StudentsManager />
    </div>
  );
}
