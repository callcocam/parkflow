import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Users, Clock, MapPin } from 'lucide-react';

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
                        <div className="text-xs text-gray-600">
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