import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import jsPDF from 'jspdf';
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerList } from "../components/VolunteerList";
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2 } from 'lucide-react';

type VolunteersContext = {
  volunteers: Volunteer[];
  handleAddVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
  handleEditVolunteer: (volunteer: Volunteer) => void;
  handleDeleteVolunteer: (id: string) => void;
  handleToggleLeader: (id: string) => void;
  shifts: Shift[];
  allocations: Record<string, string[]>;
}

export function Volunteers() {
  const { volunteers, handleAddVolunteer, handleEditVolunteer, handleDeleteVolunteer, handleToggleLeader, shifts, allocations } = useOutletContext<VolunteersContext>();
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');

  const handleEditClick = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
  };

  const handleCancelEdit = () => {
    setEditingVolunteer(null);
  };

  const handleEditSubmit = (volunteer: Volunteer) => {
    handleEditVolunteer(volunteer);
    setEditingVolunteer(null);
  };

  // Filtrar voluntários baseado no filtro de nome
  const filteredVolunteers = volunteers.filter(volunteer => {
    if (nameFilter.trim() === '') return true;
    return volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
  });

  // Função para obter o turno de um voluntário
  const getVolunteerShift = (volunteerId: string) => {
    for (const [shiftId, volunteerIds] of Object.entries(allocations)) {
      if (volunteerIds.includes(volunteerId)) {
        return shifts.find(s => s.id === shiftId);
      }
    }
    return null;
  };

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
        const shift = getVolunteerShift(volunteer.id);
        let text = `• ${volunteer.name} (${volunteer.congregation})`;
        
        if (shift) {
          const [year, month, day] = shift.date.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const formattedDate = format(date, 'dd/MM', { locale: ptBR });
          const location = shift.location === 'portaria' ? 'Portaria' : 'Pátio';
          text += ` - ${formattedDate} ${shift.startTime}-${shift.endTime} ${location}`;
        }
        
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
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      // Uma coluna para incluir informações de turno
      regularVolunteers.forEach((volunteer) => {
        const shift = getVolunteerShift(volunteer.id);
        let text = `• ${volunteer.name} (${volunteer.congregation})`;
        
        if (shift) {
          const [year, month, day] = shift.date.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const formattedDate = format(date, 'dd/MM', { locale: ptBR });
          const location = shift.location === 'portaria' ? 'Portaria' : 'Pátio';
          text += ` - ${formattedDate} ${shift.startTime}-${shift.endTime} ${location}`;
        } else {
          text += ' - Não alocado';
        }
        
        doc.text(text, 22, yPosition);
        yPosition += 4;
        
        // Nova página se necessário
        if (yPosition > 280) {
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
      <div className="p-2 sm:p-4 lg:p-6">
        {/* Cabeçalho responsivo */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Voluntários</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Filtrar por nome..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={exportToPDF}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={volunteers.length === 0}
            >
              📄 <span className="hidden sm:inline">Exportar PDF</span><span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={() => window.open('/escala-publica', '_blank')}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Escala Pública</span><span className="sm:hidden">👥 Pública</span>
            </button>
          </div>
        </div>
        
        <VolunteerForm 
          onAddVolunteer={handleAddVolunteer} 
          onEditVolunteer={handleEditSubmit}
          existingVolunteers={volunteers} 
          shifts={shifts}
          editingVolunteer={editingVolunteer}
          onCancelEdit={handleCancelEdit}
        />
        <VolunteerList 
          volunteers={filteredVolunteers} 
          onDeleteVolunteer={handleDeleteVolunteer} 
          onToggleLeader={handleToggleLeader} 
          onEditVolunteer={handleEditClick}
        />
    </div>
  );
} 