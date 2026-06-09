import { PageHeader } from "@/components/layout/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";

export default function StudentAgendaPage() {
  return (
    <div>
      <PageHeader
        title="Minhas Aulas"
        description="Veja suas aulas agendadas, remarque ou acompanhe faltas"
      />
      <AgendaView role="STUDENT" />
    </div>
  );
}
