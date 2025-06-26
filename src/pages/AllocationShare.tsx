import { useState, useEffect } from 'react';
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Users, Clock, MapPin, Calendar, Search } from 'lucide-react';

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

export function AllocationShare() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allocations, setAllocations] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState<string>('');

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const storedVolunteers = localStorage.getItem('volunteers');
      const storedShifts = localStorage.getItem('shifts');
      const storedAllocations = localStorage.getItem('allocations');

      if (storedVolunteers) {
        setVolunteers(JSON.parse(storedVolunteers));
      }
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }
      if (storedAllocations) {
        setAllocations(JSON.parse(storedAllocations));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando escala...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho fixo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              🎯 ParkFlow - Escala de Voluntários
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Adoração Pura - 2025 Congresso das Testemunhas de Jeová - Junho 2025
            </p>
            <div className="flex justify-center items-center gap-4 mt-3 text-xs sm:text-sm">
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
            <p className="text-xs text-gray-500 mt-2">
              Atualizado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          
          {/* Campo de busca */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="🔍 Buscar voluntário por nome..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {/* Indicador de filtro ativo */}
            {nameFilter.trim() !== '' && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📍 Filtrado por: "{nameFilter}"
                  <button
                    onClick={() => setNameFilter('')}
                    className="ml-2 hover:text-blue-600"
                    title="Limpar filtro"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mensagem quando não há resultados globais */}
        {nameFilter.trim() !== '' && (() => {
          const hasAnyResults = sortedDates.some(date => {
            const dayShifts = shiftsByDate[date];
            return dayShifts.some(shift => {
              const allocatedVolunteers = allocations[shift.id] || [];
              return allocatedVolunteers.some(volunteerId => {
                const volunteer = volunteers.find(v => v.id === volunteerId);
                return volunteer && volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
              });
            });
          });
          
          if (!hasAnyResults) {
            return (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <div className="text-8xl mb-6">🔍</div>
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  Nenhum voluntário encontrado
                </h2>
                <p className="text-lg text-gray-500 mb-6">
                  Não encontramos nenhum voluntário com o nome "{nameFilter}" na escala.
                </p>
                <button
                  onClick={() => setNameFilter('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Ver todos os voluntários
                </button>
              </div>
            );
          }
          return null;
        })()}

        <div className="space-y-6 sm:space-y-8">
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

            // Se há filtro ativo, verificar se o dia tem algum turno com voluntários correspondentes
            if (nameFilter.trim() !== '') {
              const dayHasResults = sortedShifts.some(shift => {
                const allocatedVolunteers = allocations[shift.id] || [];
                return allocatedVolunteers.some(volunteerId => {
                  const volunteer = volunteers.find(v => v.id === volunteerId);
                  return volunteer && volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
                });
              });
              
              // Se o dia não tem resultados, não mostrar a seção
              if (!dayHasResults) {
                return null;
              }
            }

            return (
              <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Cabeçalho do dia */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
                  <div className="flex items-center justify-center gap-3">
                    <Calendar size={24} />
                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        {getDayName(date)}
                      </h2>
                      <p className="text-sm sm:text-base opacity-90">
                        {format(new Date(`${date}T00:00:00`), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid de turnos */}
                <div className="p-4 sm:p-6">
                  {(() => {
                    // Verificar se há turnos visíveis quando há filtro
                    if (nameFilter.trim() !== '') {
                      const visibleShifts = sortedShifts.filter(shift => {
                        const allocatedVolunteers = allocations[shift.id] || [];
                        return allocatedVolunteers.some(volunteerId => {
                          const volunteer = volunteers.find(v => v.id === volunteerId);
                          return volunteer && volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
                        });
                      });
                      
                      if (visibleShifts.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                              Nenhum resultado encontrado
                            </h3>
                            <p className="text-gray-500">
                              Não encontramos voluntários com o nome "{nameFilter}" em {getDayName(date)}.
                            </p>
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  })()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {sortedShifts.map(shift => {
                      const allocatedVolunteers = allocations[shift.id] || [];
                      const allocatedCount = allocatedVolunteers.length;
                      const requiredCount = shift.requiredVolunteers;

                      // Se há filtro ativo, verificar se o turno tem voluntários que correspondem ao filtro
                      if (nameFilter.trim() !== '') {
                        const hasMatchingVolunteers = allocatedVolunteers.some(volunteerId => {
                          const volunteer = volunteers.find(v => v.id === volunteerId);
                          return volunteer && volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
                        });
                        
                        // Se não há voluntários correspondentes ao filtro, não mostrar o card
                        if (!hasMatchingVolunteers) {
                          return null;
                        }
                      }

                      return (
                        <div
                          key={shift.id}
                          className={`p-4 sm:p-5 rounded-xl border-2 ${getShiftCardColor(shift)} min-h-[300px] flex flex-col shadow-sm hover:shadow-md transition-shadow`}
                        >
                          {/* Cabeçalho do turno com dia incluído */}
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(shift)}
                                <h3 className="font-bold text-base lg:text-lg capitalize flex items-center gap-2">
                                  <MapPin size={16} className="flex-shrink-0" />
                                  <span>{shift.location}</span>
                                </h3>
                              </div>
                              {/* Dia da semana no card */}
                              <div className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full w-fit">
                                {getDayName(shift.date)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow-sm">
                              <Users size={14} />
                              <span className="font-bold">{allocatedCount}/{requiredCount}</span>
                            </div>
                          </div>

                          {/* Horário */}
                          <div className="flex flex-col gap-2 mb-4 text-gray-700">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                              <Clock size={16} className="text-blue-600" />
                              <span className="text-sm font-bold">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit font-medium">
                              {shift.periodName}
                            </span>
                          </div>

                          {/* Lista de voluntários alocados */}
                          <div className="space-y-2 flex-1 overflow-y-auto   mb-4">
                            {allocatedVolunteers.map(volunteerId => {
                              const volunteer = volunteers.find(v => v.id === volunteerId);
                              
                              // Filtrar por nome se houver filtro
                              if (nameFilter.trim() !== '' && volunteer && !volunteer.name.toLowerCase().includes(nameFilter.toLowerCase())) {
                                return null;
                              }
                              
                              return volunteer ? (
                                <div key={volunteer.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                                  <div className="flex-shrink-0">
                                    <Avatar volunteer={volunteer} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-sm text-gray-900 truncate">{volunteer.name}</p>
                                      {volunteer.isTeamLeader && (
                                        <div title="Líder de Equipe" className="flex-shrink-0">
                                          <Star size={14} className="text-yellow-500" />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{volunteer.congregation}</p>
                                    <p className="text-xs text-gray-500">{volunteer.phone}</p>
                                  </div>
                                </div>
                              ) : null;
                            })}

                            {/* Mostrar vagas vazias */}
                            {Array.from({ length: Math.min(requiredCount - allocatedCount, 2) }).map((_, index) => (
                              <div key={`empty-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                  <Users size={14} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-500 italic">Vaga disponível</p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Mostrar indicador se há mais vagas */}
                            {(requiredCount - allocatedCount) > 2 && (
                              <div className="text-center py-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 font-medium">
                                  +{(requiredCount - allocatedCount) - 2} vagas disponíveis
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status do turno */}
                          <div className="mt-auto pt-3 border-t border-gray-200">
                            <div className="text-center">
                              {allocatedCount === 0 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                                  ⚠️ Sem voluntários alocados
                                </span>
                              )}
                              {allocatedCount > 0 && allocatedCount < requiredCount && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100">
                                  ⚠️ Faltam {requiredCount - allocatedCount} voluntário(s)
                                </span>
                              )}
                              {allocatedCount === requiredCount && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                                  ✅ Turno completo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo geral */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-900">📊 Resumo Geral</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-800">{totalShifts}</div>
                    <div className="text-sm text-gray-600">Total de Turnos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-800">{completeShifts}</div>
                    <div className="text-sm text-green-600">Turnos Completos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-800">{incompleteShifts}</div>
                    <div className="text-sm text-yellow-600">Turnos Incompletos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-800">{emptyShifts}</div>
                    <div className="text-sm text-red-600">Turnos Vazios</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-gray-500 text-sm bg-white rounded-xl p-4">
          <p className="mb-2">
            <strong>ParkFlow</strong> - Sistema de Gestão de Voluntários
          </p>
          <p>
            Esta é uma visualização pública da escala de voluntários.
          </p>
          <p className="text-xs mt-2 opacity-75">
            Para atualizar sua disponibilidade, entre em contato com a organização do evento.
          </p>
        </div>
      </div>
    </div>
  );
} 