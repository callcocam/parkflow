import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Users, Clock, MapPin, Download, Share2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

// Contexto completo vindo do Root
type AllocationContext = {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
}

const Avatar = ({ volunteer }: { volunteer: Volunteer }) => {
  if (volunteer.imageUrl) {
    return <img src={volunteer.imageUrl} alt={volunteer.name} className="h-8 w-8 rounded-full object-cover" />;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return (
    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
      {getInitials(volunteer.name)}
    </div>
  )
}

export function Allocation() {
  const { volunteers, shifts, allocations } = useOutletContext<AllocationContext>();

  // Função para gerar PDF detalhado
  const generateDetailedPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Título
    pdf.setFontSize(20);
    pdf.text('Escala de Voluntários - ParkFlow', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, yPosition);
    yPosition += 20;

    sortedDates.forEach(date => {
      const dayShifts = shiftsByDate[date];
      const sortedShifts = dayShifts.sort((a, b) => {
        if (a.location !== b.location) {
          return a.location === 'portaria' ? -1 : 1;
        }
        return a.startTime.localeCompare(b.startTime);
      });

      // Cabeçalho do dia
      pdf.setFontSize(16);
      pdf.text(`${getDayName(date)} - ${format(new Date(`${date}T00:00:00`), 'dd/MM/yyyy')}`, 20, yPosition);
      yPosition += 10;

      sortedShifts.forEach(shift => {
        const allocatedVolunteers = allocations[shift.id] || [];
        
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        // Informações do turno
        pdf.setFontSize(12);
        pdf.text(`${shift.location.toUpperCase()} - ${shift.startTime} às ${shift.endTime} (${shift.periodName})`, 25, yPosition);
        yPosition += 8;
        
        if (allocatedVolunteers.length === 0) {
          pdf.setFontSize(10);
          pdf.text('⚠️ Nenhum voluntário alocado', 30, yPosition);
          yPosition += 6;
        } else {
          allocatedVolunteers.forEach(volunteerId => {
            const volunteer = volunteers.find(v => v.id === volunteerId);
            if (volunteer) {
              pdf.setFontSize(10);
              const leaderMark = volunteer.isTeamLeader ? ' ⭐' : '';
              pdf.text(`• ${volunteer.name} - ${volunteer.phone} (${volunteer.congregation})${leaderMark}`, 30, yPosition);
              yPosition += 6;
            }
          });
        }
        yPosition += 5;
      });
      yPosition += 10;
    });

    pdf.save(`escala-voluntarios-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  // Função para gerar card de imagem para um turno específico
  const generateShiftCard = async (shift: Shift) => {
    const allocatedVolunteers = allocations[shift.id] || [];
    
    // Criar elemento temporário para o card
    const cardElement = document.createElement('div');
    cardElement.style.cssText = `
      width: 400px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: Arial, sans-serif;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: absolute;
      left: -9999px;
      top: -9999px;
    `;

    const dayName = getDayName(shift.date);
    const dateFormatted = format(new Date(`${shift.date}T00:00:00`), 'dd/MM/yyyy');
    
    cardElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">ParkFlow</h1>
        <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Escala de Voluntários</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
        <h2 style="margin: 0 0 10px 0; font-size: 20px;">${dayName}</h2>
        <p style="margin: 0; font-size: 16px;">${dateFormatted}</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; text-transform: capitalize;">📍 ${shift.location}</h3>
        <p style="margin: 0; font-size: 16px;">🕐 ${shift.startTime} - ${shift.endTime}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${shift.periodName}</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px;">👥 Voluntários (${allocatedVolunteers.length}/${shift.requiredVolunteers})</h3>
        ${allocatedVolunteers.length === 0 ? 
          '<p style="margin: 0; font-style: italic; opacity: 0.8;">Nenhum voluntário alocado</p>' :
          allocatedVolunteers.map(volunteerId => {
            const volunteer = volunteers.find(v => v.id === volunteerId);
            if (!volunteer) return '';
            const leaderMark = volunteer.isTeamLeader ? ' ⭐' : '';
            return `
              <div style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; font-size: 14px;">${volunteer.name}${leaderMark}</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">📞 ${volunteer.phone}</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.8;">${volunteer.congregation}</p>
              </div>
            `;
          }).join('')
        }
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
        <p style="margin: 0; font-size: 12px; opacity: 0.7;">Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
      </div>
    `;

    document.body.appendChild(cardElement);

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        width: 400,
        height: cardElement.offsetHeight
      });

      document.body.removeChild(cardElement);

      // Converter para blob e criar URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `turno-${shift.location}-${dayName}-${shift.startTime.replace(':', '')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Card do turno gerado com sucesso!');
        }
      }, 'image/png');

    } catch (error) {
      document.body.removeChild(cardElement);
      toast.error('Erro ao gerar card do turno');
      console.error('Erro:', error);
    }
  };

  // Função para compartilhar turno no WhatsApp
  const shareShiftOnWhatsApp = (shift: Shift) => {
    const allocatedVolunteers = allocations[shift.id] || [];
    const dayName = getDayName(shift.date);
    const dateFormatted = format(new Date(`${shift.date}T00:00:00`), 'dd/MM/yyyy');
    
    let message = `🎯 *ParkFlow - Escala de Voluntários*\n\n`;
    message += `📅 *${dayName}* - ${dateFormatted}\n`;
    message += `📍 *Local:* ${shift.location.charAt(0).toUpperCase() + shift.location.slice(1)}\n`;
    message += `🕐 *Horário:* ${shift.startTime} - ${shift.endTime} (${shift.periodName})\n\n`;
    
    if (allocatedVolunteers.length === 0) {
      message += `⚠️ *Nenhum voluntário alocado ainda*\n`;
    } else {
      message += `👥 *Voluntários (${allocatedVolunteers.length}/${shift.requiredVolunteers}):*\n`;
      allocatedVolunteers.forEach((volunteerId, index) => {
        const volunteer = volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
          const leaderMark = volunteer.isTeamLeader ? ' ⭐' : '';
          message += `${index + 1}. ${volunteer.name}${leaderMark}\n`;
          message += `   📞 ${volunteer.phone}\n`;
          message += `   🏛️ ${volunteer.congregation}\n\n`;
        }
      });
    }
    
    message += `_Gerado pelo ParkFlow em ${format(new Date(), 'dd/MM/yyyy HH:mm')}_`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Se há voluntários, criar grupos para envio
    if (allocatedVolunteers.length > 0) {
      const volunteerPhones = allocatedVolunteers
        .map(id => volunteers.find(v => v.id === id))
        .filter(v => v && v.phone)
        .map(v => v!.phone.replace(/\D/g, ''));
      
      if (volunteerPhones.length > 0) {
        // Abrir WhatsApp Web com a mensagem
        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        
        toast.success(`Mensagem preparada para ${volunteerPhones.length} voluntário(s)!`);
      } else {
        toast.error('Nenhum telefone válido encontrado para os voluntários');
      }
    } else {
      // Abrir WhatsApp Web com a mensagem mesmo sem voluntários
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Mensagem preparada para compartilhamento!');
    }
  };

  // Agrupar turnos por data
  const shiftsByDate = shifts.reduce((acc, shift) => {
    if (!acc[shift.date]) {
      acc[shift.date] = [];
    }
    acc[shift.date].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  // Ordenar datas
  const sortedDates = Object.keys(shiftsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Função para determinar a cor do card baseado no status
  const getShiftCardColor = (shift: Shift) => {
    const allocatedVolunteers = allocations[shift.id] || [];
    const allocatedCount = allocatedVolunteers.length;
    const requiredCount = shift.requiredVolunteers;

    if (allocatedCount === 0) {
      return 'bg-red-50 border-red-200'; // Vazio - vermelho
    } else if (allocatedCount < requiredCount) {
      return 'bg-yellow-50 border-yellow-200'; // Incompleto - amarelo
    } else {
      return 'bg-green-50 border-green-200'; // Completo - verde
    }
  };

  // Função para obter o ícone de status
  const getStatusIcon = (shift: Shift) => {
    const allocatedVolunteers = allocations[shift.id] || [];
    const allocatedCount = allocatedVolunteers.length;
    const requiredCount = shift.requiredVolunteers;

    if (allocatedCount === 0) {
      return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
    } else if (allocatedCount < requiredCount) {
      return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
    } else {
      return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
    }
  };

  // Função para obter o nome do dia da semana
  const getDayName = (date: string) => {
    const dayOfWeek = format(new Date(`${date}T00:00:00`), "EEEE", {
      locale: ptBR
    });
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Visualização das Alocações</h1>
        <div className="flex items-center gap-6">
          {/* Botão PDF */}
          <button
            onClick={generateDetailedPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <FileText size={16} />
            Gerar PDF Detalhado
          </button>
          
          {/* Legenda de status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Incompleto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Vazio</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {sortedDates.map(date => {
          const dayShifts = shiftsByDate[date];
          // Ordenar turnos por horário de início
          const sortedShifts = dayShifts.sort((a, b) => {
            // Primeiro por local (portaria antes de patio)
            if (a.location !== b.location) {
              return a.location === 'portaria' ? -1 : 1;
            }
            // Depois por horário
            return a.startTime.localeCompare(b.startTime);
          });

          return (
            <div key={date} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {getDayName(date)} - {format(new Date(`${date}T00:00:00`), 'dd/MM/yyyy')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedShifts.map(shift => {
                  const allocatedVolunteers = allocations[shift.id] || [];
                  const allocatedCount = allocatedVolunteers.length;
                  const requiredCount = shift.requiredVolunteers;

                  return (
                    <div
                      key={shift.id}
                      className={`p-4 rounded-lg border-2 ${getShiftCardColor(shift)}`}
                    >
                      {/* Cabeçalho do turno */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(shift)}
                          <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                            <MapPin size={16} />
                            {shift.location}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Users size={14} />
                          {allocatedCount}/{requiredCount}
                        </div>
                      </div>

                      {/* Horário */}
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Clock size={14} />
                        <span className="text-sm font-medium">
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {shift.periodName}
                        </span>
                      </div>

                      {/* Lista de voluntários alocados */}
                      <div className="space-y-2">
                        {allocatedVolunteers.map(volunteerId => {
                          const volunteer = volunteers.find(v => v.id === volunteerId);
                          return volunteer ? (
                            <div key={volunteer.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <Avatar volunteer={volunteer} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{volunteer.name}</p>
                                <p className="text-xs text-gray-500 truncate">{volunteer.congregation}</p>
                              </div>
                                                             {volunteer.isTeamLeader && (
                                 <div title="Líder de Equipe">
                                   <Star size={14} className="text-yellow-500 flex-shrink-0" />
                                 </div>
                               )}
                            </div>
                          ) : null;
                        })}

                        {/* Mostrar vagas vazias */}
                        {Array.from({ length: requiredCount - allocatedCount }).map((_, index) => (
                          <div key={`empty-${index}`} className="flex items-center gap-2 p-2 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users size={14} className="text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 italic">Vaga disponível</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Resumo do status */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-3">
                          {allocatedCount === 0 && (
                            <span className="text-red-600 font-medium">⚠️ Turno sem voluntários</span>
                          )}
                          {allocatedCount > 0 && allocatedCount < requiredCount && (
                            <span className="text-yellow-600 font-medium">
                              ⚠️ Faltam {requiredCount - allocatedCount} voluntário(s)
                            </span>
                          )}
                          {allocatedCount === requiredCount && (
                            <span className="text-green-600 font-medium">✅ Turno completo</span>
                          )}
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => generateShiftCard(shift)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Download size={12} />
                            Card
                          </button>
                          <button
                            onClick={() => shareShiftOnWhatsApp(shift)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Share2 size={12} />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo geral */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const totalShifts = shifts.length;
            const completeShifts = shifts.filter(shift => {
              const allocated = allocations[shift.id] || [];
              return allocated.length === shift.requiredVolunteers;
            }).length;
            const incompleteShifts = shifts.filter(shift => {
              const allocated = allocations[shift.id] || [];
              return allocated.length > 0 && allocated.length < shift.requiredVolunteers;
            }).length;
            const emptyShifts = shifts.filter(shift => {
              const allocated = allocations[shift.id] || [];
              return allocated.length === 0;
            }).length;

            return (
              <>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{totalShifts}</div>
                  <div className="text-sm text-gray-600">Total de Turnos</div>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{completeShifts}</div>
                  <div className="text-sm text-green-600">Turnos Completos</div>
                </div>
                <div className="text-center p-4 bg-yellow-100 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-800">{incompleteShifts}</div>
                  <div className="text-sm text-yellow-600">Turnos Incompletos</div>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-800">{emptyShifts}</div>
                  <div className="text-sm text-red-600">Turnos Vazios</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  )
}