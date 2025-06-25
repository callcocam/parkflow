import { useOutletContext } from "react-router-dom";
import jsPDF from 'jspdf';
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerList } from "../components/VolunteerList";
import type { Volunteer } from "../types";

type VolunteersContext = {
  volunteers: Volunteer[];
  handleAddVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
  handleDeleteVolunteer: (id: string) => void;
  handleToggleLeader: (id: string) => void;
}

export function Volunteers() {
  const { volunteers, handleAddVolunteer, handleDeleteVolunteer, handleToggleLeader } = useOutletContext<VolunteersContext>();

  const exportToPDF = () => {
    if (volunteers.length === 0) {
      alert('Não há voluntários para exportar!');
      return;
    }

    const doc = new jsPDF();
    
    // Configurações do PDF - mais compacto
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VOLUNTÁRIOS - PARKFLOW', 20, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${volunteers.length} | ${new Date().toLocaleDateString('pt-BR')}`, 20, 22);
    
    // Separar líderes e voluntários regulares
    const leaders = volunteers.filter(v => v.isTeamLeader);
    const regularVolunteers = volunteers.filter(v => !v.isTeamLeader);
    
    let yPosition = 32;
    
    // Líderes primeiro - formato mais compacto
    if (leaders.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('LÍDERES:', 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      leaders.forEach((volunteer) => {
        const text = `• ${volunteer.name} (${volunteer.congregation})`;
        doc.text(text, 22, yPosition);
        yPosition += 4;
      });
      
      yPosition += 3;
    }
    
    // Voluntários regulares - formato mais compacto
    if (regularVolunteers.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('VOLUNTÁRIOS:', 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Organizar em duas colunas para economizar espaço
      const itemsPerColumn = Math.ceil(regularVolunteers.length / 2);
      
      regularVolunteers.forEach((volunteer, index) => {
        const isSecondColumn = index >= itemsPerColumn;
        const xPosition = isSecondColumn ? 110 : 22;
        const adjustedIndex = isSecondColumn ? index - itemsPerColumn : index;
        const currentY = yPosition + (adjustedIndex * 4);
        
        const text = `• ${volunteer.name} (${volunteer.congregation})`;
        doc.text(text, xPosition, currentY);
        
        // Nova página se necessário
        if (currentY > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    
    // Salvar o PDF com nome mais simples
    const fileName = `voluntarios-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Voluntários</h1>
        <button
          onClick={exportToPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          disabled={volunteers.length === 0}
        >
          📄 Exportar PDF
        </button>
      </div>
      <VolunteerForm onAddVolunteer={handleAddVolunteer} existingVolunteers={volunteers} />
      <VolunteerList volunteers={volunteers} onDeleteVolunteer={handleDeleteVolunteer} onToggleLeader={handleToggleLeader} />
    </div>
  );
} 