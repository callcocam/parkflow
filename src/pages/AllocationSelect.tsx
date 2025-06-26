import { useOutletContext } from "react-router-dom";
import { useState, useCallback } from "react";
import type { Volunteer, Shift } from "../types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Users, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

type AllocationSelectContext = {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleAddAllocation: (shiftId: string, volunteerId: string) => Promise<void>;
  handleRemoveAllocation: (shiftId: string, volunteerId: string) => Promise<void>;
}

const Avatar = ({ volunteer }: { volunteer: Volunteer }) => {
    if (volunteer.imageUrl) {
        return <img src={volunteer.imageUrl} alt={volunteer.name} className="h-10 w-10 rounded-full object-cover" />;
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length === 1) return names[0].substring(0,2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    return (
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(volunteer.name)}
        </div>
    )
}

export function AllocationSelect() {
  const { volunteers, shifts, allocations, setAllocations, handleAddAllocation, handleRemoveAllocation } = useOutletContext<AllocationSelectContext>();
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'portaria' | 'patio'>('all');
  const [nameFilter, setNameFilter] = useState<string>('');

  // Função para obter todos os turnos de um voluntário
  const getVolunteerShifts = (volunteerId: string): string[] => {
    const volunteerShifts: string[] = [];
    for (const [shiftId, volunteerIds] of Object.entries(allocations)) {
      if (volunteerIds.includes(volunteerId)) {
        volunteerShifts.push(shiftId);
      }
    }
    return volunteerShifts;
  };

  // Função para verificar se voluntário está em um turno específico
  const isVolunteerInShift = (volunteerId: string, shiftId: string): boolean => {
    return allocations[shiftId]?.includes(volunteerId) || false;
  };

  // Função para alterar a alocação de um voluntário
  const handleShiftChange = useCallback(async (volunteerId: string, newShiftId: string) => {
    const volunteerShifts = getVolunteerShifts(volunteerId);
    
    // Se selecionou "Não alocado", remove o voluntário de todos os turnos
    if (newShiftId === '') {
      if (volunteerShifts.length > 0) {
        // Remover de todos os turnos usando a função híbrida
        for (const shiftId of volunteerShifts) {
          try {
            await handleRemoveAllocation(shiftId, volunteerId);
          } catch (error) {
            console.error(`Erro ao remover voluntário do turno ${shiftId}:`, error);
          }
        }
        toast.success('Voluntário removido de todos os turnos');
      }
      return;
    }

    const targetShift = shifts.find(s => s.id === newShiftId);
    if (!targetShift) return;

    const currentVolunteersInShift = allocations[newShiftId] || [];

    // Validação de capacidade
    if (currentVolunteersInShift.length >= targetShift.requiredVolunteers && !currentVolunteersInShift.includes(volunteerId)) {
      toast.error(`O turno já está cheio (${targetShift.requiredVolunteers} voluntários)`);
      return;
    }

    // Verificar se o voluntário já está no turno selecionado
    const isAlreadyInShift = currentVolunteersInShift.includes(volunteerId);
    
    try {
      if (isAlreadyInShift) {
        // Se já está no turno, remove (toggle)
        await handleRemoveAllocation(newShiftId, volunteerId);
        toast.success('Voluntário removido do turno');
      } else {
        // Se não está no turno, adiciona
        await handleAddAllocation(newShiftId, volunteerId);
        toast.success('Voluntário alocado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao alterar alocação:', error);
      toast.error('Erro ao alterar alocação');
    }
  }, [getVolunteerShifts, shifts, allocations, handleAddAllocation, handleRemoveAllocation]);

  // Função para formatar o turno para exibição
  const formatShiftDisplay = (shift: Shift): string => {
    // Criar a data corretamente para evitar problemas de fuso horário
    const [year, month, day] = shift.date.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const formattedDate = format(date, 'dd/MM', { locale: ptBR });
    const dayName = format(date, 'EEEE', { locale: ptBR });
    const location = shift.location === 'portaria' ? 'Portaria' : 'Pátio';
    return `${formattedDate} (${dayName}) - ${shift.startTime}-${shift.endTime} - ${location}`;
  };

  // Filtrar turnos baseado nos filtros
  const filteredShifts = shifts.filter(shift => {
    if (dateFilter !== 'all' && shift.date !== dateFilter) return false;
    if (locationFilter !== 'all' && shift.location !== locationFilter) return false;
    return true;
  });

  // Obter datas únicas para o filtro
  const uniqueDates = [...new Set(shifts.map(s => s.date))].sort();

  // Filtrar voluntários baseado no filtro de nome
  const filteredVolunteers = volunteers.filter(volunteer => {
    if (nameFilter.trim() === '') return true;
    return volunteer.name.toLowerCase().includes(nameFilter.toLowerCase());
  });

  // Função para obter estatísticas do turno
  const getShiftStats = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    const allocated = allocations[shiftId]?.length || 0;
    const required = shift?.requiredVolunteers || 0;
    
    // Verificar se é um turno especial do pátio (primeiro ou último com 32 voluntários)
    const isSpecialPatioShift = shift?.location === 'patio' && shift?.requiredVolunteers === 32;
    
    return { 
      allocated, 
      required, 
      isFull: allocated >= required,
      isSpecialPatioShift 
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Alocação por Seleção</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as datas</option>
            {uniqueDates.map(dateString => {
              const [year, month, day] = dateString.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return (
                <option key={dateString} value={dateString}>
                  {format(date, 'dd/MM/yyyy (EEEE)', { locale: ptBR })}
                </option>
              );
            })}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value as 'all' | 'portaria' | 'patio')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os locais</option>
            <option value="portaria">Portaria</option>
            <option value="patio">Pátio</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Total Voluntários</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{volunteers.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Total Turnos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{filteredShifts.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">Alocados</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {Object.values(allocations).flat().length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Líderes</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {volunteers.filter(v => v.isTeamLeader).length}
          </p>
        </div>
      </div>

      {/* Lista de Voluntários com Seleção */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Lista de Voluntários</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voluntário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Congregação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnos Atuais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selecionar Turnos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.map((volunteer) => {
                const volunteerShifts = getVolunteerShifts(volunteer.id);
                const currentShifts = volunteerShifts.map(shiftId => shifts.find(s => s.id === shiftId)).filter(Boolean);
                
                return (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar volunteer={volunteer} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {volunteer.name}
                            </span>
                                                         {volunteer.isTeamLeader && (
                               <Star size={16} className="text-yellow-500" />
                             )}
                          </div>
                          <span className="text-sm text-gray-500">{volunteer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {volunteer.congregation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {volunteer.isTeamLeader ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Líder
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Voluntário
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentShifts.length > 0 ? (
                        <div className="space-y-1">
                          {currentShifts.map((shift, index) => (
                            <div key={index}>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="font-medium">
                                  {shift?.location === 'portaria' ? 'Portaria' : 'Pátio'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {(() => {
                                  if (!shift) return '';
                                  const [year, month, day] = shift.date.split('-');
                                  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                  return format(date, 'dd/MM', { locale: ptBR });
                                })()} - {shift?.startTime}-{shift?.endTime}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não alocado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {filteredShifts.map((shift) => {
                          const stats = getShiftStats(shift.id);
                          const isVolunteerInThisShift = isVolunteerInShift(volunteer.id, shift.id);
                          
                          // Verificar se o voluntário está indisponível para este turno
                          const isUnavailable = volunteer.unavailableShifts?.includes(shift.id) || false;
                          
                          // Para turnos especiais do pátio, sempre mostrar como CHEIO e desabilitar
                          if (stats.isSpecialPatioShift) {
                            return (
                              <div key={shift.id} className="flex items-center space-x-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={isVolunteerInThisShift}
                                  disabled={true}
                                  className="h-3 w-3 rounded border-gray-300"
                                />
                                <span className="text-gray-500">
                                  {formatShiftDisplay(shift)} - CHEIO
                                </span>
                              </div>
                            );
                          }
                          
                          // Se está indisponível, não mostrar a opção (exceto se já está alocado neste turno)
                          if (isUnavailable && !isVolunteerInThisShift) {
                            return null;
                          }
                          
                          const canSelect = (!stats.isFull || isVolunteerInThisShift) && !isUnavailable;
                          
                          return (
                            <div key={shift.id} className="flex items-center space-x-2 text-xs">
                              <input
                                type="checkbox"
                                checked={isVolunteerInThisShift}
                                onChange={() => handleShiftChange(volunteer.id, shift.id)}
                                disabled={!canSelect}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className={canSelect ? 'text-gray-900' : 'text-gray-400'}>
                                {formatShiftDisplay(shift)} ({stats.allocated}/{stats.required})
                                {stats.isFull && !isVolunteerInThisShift ? ' - CHEIO' : ''}
                                {isUnavailable && isVolunteerInThisShift ? ' - INDISPONÍVEL' : ''}
                              </span>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 