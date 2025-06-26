import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Users, Clock, MapPin, Download, Share2, FileText, Share } from 'lucide-react';
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

  // Função para compartilhar card de imagem
  const shareShiftCard = async (shift: Shift) => {
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

      // Converter canvas para blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const fileName = `turno-${shift.location}-${dayName}-${shift.startTime.replace(':', '')}.png`;
          
          // Verificar se o navegador suporta Web Share API
          if (navigator.share && navigator.canShare) {
            try {
              const file = new File([blob], fileName, { type: 'image/png' });
              
              // Verificar se pode compartilhar arquivos
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: `Escala ParkFlow - ${dayName}`,
                  text: `Turno de ${shift.location} - ${shift.startTime} às ${shift.endTime}`,
                  files: [file]
                });
                toast.success('Card compartilhado com sucesso!');
                return;
              }
            } catch (error) {
              console.log('Erro no Web Share API, usando fallback:', error);
            }
          }
          
          // Fallback: criar URL para download/compartilhamento
          const url = URL.createObjectURL(blob);
          
          // Tentar usar Web Share API apenas com URL
          if (navigator.share) {
            try {
              await navigator.share({
                title: `Escala ParkFlow - ${dayName}`,
                text: `Turno de ${shift.location} - ${shift.startTime} às ${shift.endTime}`,
                url: window.location.href
              });
              
              // Criar link temporário para download da imagem
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              toast.success('Card preparado para compartilhamento!');
            } catch (error) {
              // Se Web Share falhar, fazer download direto
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success('Card baixado! Compartilhe o arquivo gerado.');
            }
          } else {
            // Navegador não suporta Web Share, fazer download direto
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Card baixado! Compartilhe o arquivo gerado.');
          }
          
          // Limpar URL após um tempo
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }, 'image/png');

    } catch (error) {
      document.body.removeChild(cardElement);
      toast.error('Erro ao gerar card para compartilhamento');
      console.error('Erro:', error);
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
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Cabeçalho responsivo */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Visualização das Alocações</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
          {/* Botão PDF */}
          <button
            onClick={generateDetailedPDF}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <FileText size={16} />
            <span className="sm:inline">Gerar PDF Detalhado</span>
          </button>
          
          {/* Legenda de status */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
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

      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
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
            <div key={date} className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  <span className="block sm:inline">{getDayName(date)}</span>
                  <span className="block sm:inline sm:ml-2 text-base sm:text-lg lg:text-xl text-gray-600">
                    {format(new Date(`${date}T00:00:00`), 'dd/MM/yyyy')}
                  </span>
                </h2>
              </div>

              {/* Grid responsivo otimizado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {sortedShifts.map(shift => {
                  const allocatedVolunteers = allocations[shift.id] || [];
                  const allocatedCount = allocatedVolunteers.length;
                  const requiredCount = shift.requiredVolunteers;

                  return (
                    <div
                      key={shift.id}
                      className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 ${getShiftCardColor(shift)} min-h-[280px] sm:min-h-[320px] flex flex-col`}
                    >
                      {/* Cabeçalho do turno */}
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getStatusIcon(shift)}
                          <h3 className="font-bold text-sm sm:text-base lg:text-lg capitalize flex items-center gap-1 sm:gap-2">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span className="truncate">{shift.location}</span>
                          </h3>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 flex-shrink-0 bg-white px-2 py-1 rounded">
                          <Users size={12} />
                          <span className="font-medium">{allocatedCount}/{requiredCount}</span>
                        </div>
                      </div>

                      {/* Horário */}
                      <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded w-fit ml-4 sm:ml-0">
                          {shift.periodName}
                        </span>
                      </div>

                      {/* Lista de voluntários alocados - área flexível otimizada */}
                      <div className="space-y-1 sm:space-y-2 flex-1 mb-3 sm:mb-4 overflow-y-auto max-h-32 sm:max-h-40">
                        {allocatedVolunteers.map(volunteerId => {
                          const volunteer = volunteers.find(v => v.id === volunteerId);
                          return volunteer ? (
                            <div key={volunteer.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <div className="flex-shrink-0">
                                <Avatar volunteer={volunteer} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-xs sm:text-sm truncate">{volunteer.name}</p>
                                  {volunteer.isTeamLeader && (
                                    <div title="Líder de Equipe">
                                      <Star size={12} className="text-yellow-500 flex-shrink-0" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{volunteer.congregation}</p>
                              </div>
                            </div>
                          ) : null;
                        })}

                        {/* Mostrar vagas vazias - otimizado para mobile */}
                        {Array.from({ length: Math.min(requiredCount - allocatedCount, 3) }).map((_, index) => (
                          <div key={`empty-${index}`} className="flex items-center gap-2 p-2 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <Users size={12} className="text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-500 italic">Vaga disponível</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Mostrar indicador se há mais vagas */}
                        {(requiredCount - allocatedCount) > 3 && (
                          <div className="text-center py-1">
                            <p className="text-xs text-gray-500">
                              +{(requiredCount - allocatedCount) - 3} vagas adicionais
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Resumo do status e botões - fixo no final */}
                      <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 sm:mb-3">
                          {allocatedCount === 0 && (
                            <span className="text-red-600 font-medium">⚠️ Sem voluntários</span>
                          )}
                          {allocatedCount > 0 && allocatedCount < requiredCount && (
                            <span className="text-yellow-600 font-medium">
                              ⚠️ Faltam {requiredCount - allocatedCount}
                            </span>
                          )}
                          {allocatedCount === requiredCount && (
                            <span className="text-green-600 font-medium">✅ Completo</span>
                          )}
                        </div>
                        
                        {/* Botões de ação - otimizados para mobile */}
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => generateShiftCard(shift)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-2 sm:py-3 lg:py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                            >
                              <Download size={14} />
                              <span className="hidden sm:inline">Card</span>
                              <span className="sm:hidden">💾</span>
                            </button>
                            <button
                              onClick={() => shareShiftCard(shift)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-3 py-2 sm:py-3 lg:py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                            >
                              <Share size={14} />
                              <span className="hidden sm:inline">Compartilhar</span>
                              <span className="sm:hidden">📤</span>
                            </button>
                          </div>
                          <button
                            onClick={() => shareShiftOnWhatsApp(shift)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-2 sm:py-3 lg:py-2 rounded text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                          >
                            <Share2 size={14} />
                            <span className="hidden sm:inline">WhatsApp</span>
                            <span className="sm:hidden">💬</span>
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

      {/* Resumo geral - responsivo otimizado */}
      <div className="mt-4 sm:mt-6 lg:mt-8 bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
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
                <div className="text-center p-2 sm:p-3 lg:p-4 bg-white rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{totalShifts}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-2 sm:p-3 lg:p-4 bg-green-100 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800">{completeShifts}</div>
                  <div className="text-xs sm:text-sm text-green-600">Completos</div>
                </div>
                <div className="text-center p-2 sm:p-3 lg:p-4 bg-yellow-100 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-800">{incompleteShifts}</div>
                  <div className="text-xs sm:text-sm text-yellow-600">Incompletos</div>
                </div>
                <div className="text-center p-2 sm:p-3 lg:p-4 bg-red-100 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-800">{emptyShifts}</div>
                  <div className="text-xs sm:text-sm text-red-600">Vazios</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  )
}