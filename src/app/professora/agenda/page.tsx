import { PageHeader } from "@/components/layout/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";

export default function TeacherAgendaPage() {
  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Controle sua agenda, veja quais alunos vêm em cada dia e selecione os exercícios"
      />
      <AgendaView role="TEACHER" />
    </div>
  );
}
