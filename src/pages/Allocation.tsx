import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift } from "../types";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { VolunteerDraggable } from "../components/VolunteerDraggable";
import { ShiftDroppable } from "../components/ShiftDroppable";
import { SortableShiftItem } from "../components/SortableShiftItem";
import toast from 'react-hot-toast';
import { format } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { Star } from 'lucide-react';

// Contexto completo vindo do Root
type AllocationContext = {
  volunteers: Volunteer[];
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  allocations: Record<string, string[]>;
  setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  // Adicionaremos funções de manipulação de alocação aqui depois
}

const Avatar = ({ volunteer }: { volunteer: Volunteer }) => {
    if (volunteer.imageUrl) {
        return <img src={volunteer.imageUrl} alt={volunteer.name} className="h-8 w-8 rounded-full object-cover" />;
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length === 1) return names[0].substring(0,2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    return (
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
            {getInitials(volunteer.name)}
        </div>
    )
}

export function Allocation() {
  const { volunteers, shifts, setShifts, allocations, setAllocations } = useOutletContext<AllocationContext>();
  const [activeTab, setActiveTab] = useState<'portaria' | 'patio'>('portaria');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'Manhã' | 'Tarde'>('all');

  const handleAutoAllocate = () => {
    console.log("Iniciando distribuição automática...");
    const newAllocations: Record<string, string[]> = {};
    const allocatedVolunteersByDay: Record<string, string[]> = {};

    const sortedShifts = [...shifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));

    for (const shift of sortedShifts) {
        newAllocations[shift.id] = [];
        const volunteersForThisDay = allocatedVolunteersByDay[shift.date] || [];
        const availableForThisShift = volunteers.filter(v => !volunteersForThisDay.includes(v.id));

        // Prioriza líderes de equipe se houver necessidade
        const teamLeaders = availableForThisShift.filter(v => v.isTeamLeader);
        for (const volunteer of teamLeaders) {
            if (newAllocations[shift.id].length < shift.requiredVolunteers) {
                newAllocations[shift.id].push(volunteer.id);
                if (!allocatedVolunteersByDay[shift.date]) allocatedVolunteersByDay[shift.date] = [];
                allocatedVolunteersByDay[shift.date].push(volunteer.id);
            }
        }
        
        const normalVolunteersPool = availableForThisShift.filter(v => !v.isTeamLeader && !newAllocations[shift.id].includes(v.id));

        // Lógica de balanceamento por congregação
        while (newAllocations[shift.id].length < shift.requiredVolunteers && normalVolunteersPool.length > 0) {
            const congregationCounts = newAllocations[shift.id].reduce((acc, vId) => {
                const vol = volunteers.find(v => v.id === vId);
                if (vol) acc[vol.congregation] = (acc[vol.congregation] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Ordena os candidatos para priorizar congregações menos representadas
            normalVolunteersPool.sort((a, b) => {
                const countA = congregationCounts[a.congregation] || 0;
                const countB = congregationCounts[b.congregation] || 0;
                return countA - countB;
            });

            // Adiciona o melhor candidato
            const volunteerToAdd = normalVolunteersPool.shift();
            if (volunteerToAdd) {
                newAllocations[shift.id].push(volunteerToAdd.id);
                if (!allocatedVolunteersByDay[shift.date]) allocatedVolunteersByDay[shift.date] = [];
                allocatedVolunteersByDay[shift.date].push(volunteerToAdd.id);
            }
        }
    }

    setAllocations(newAllocations);
    toast.success("Voluntários distribuídos automaticamente!");
    console.log("Distribuição automática concluída!", newAllocations);
  };

  const findShiftOfVolunteer = (volunteerId: string, currentAllocations: Record<string, string[]>) => {
    return Object.keys(currentAllocations).find(shiftId => currentAllocations[shiftId].includes(volunteerId));
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    // Lógica de reordenação de turnos
    if (active.data.current?.type === 'shift' && over) {
        const oldIndex = shifts.findIndex(s => s.id === active.id);
        const newIndex = shifts.findIndex(s => s.id === over.id);
        if (oldIndex !== newIndex) {
            setShifts(prev => arrayMove(prev, oldIndex, newIndex));
        }
        return;
    }

    const volunteerId = String(active.id);

    if (!over) return;
    
    const targetShiftId = String(over.id);
    
    if (targetShiftId !== 'available-volunteers') {
        const targetShift = shifts.find(s => s.id === targetShiftId);
        const volunteer = volunteers.find(v => v.id === volunteerId);

        if (!targetShift || !volunteer) return;

        const currentVolunteersInShift = allocations[targetShiftId] || [];

        // 1. Validação de capacidade
        if (currentVolunteersInShift.length >= targetShift.requiredVolunteers) {
            toast.error(`O turno "${targetShift.location}" já está cheio.`);
            return; 
        }

        // 2. Validação de Líder de Equipe (ex: permitir apenas um) - Opcional, mantendo simples por agora
        // if (volunteer.isTeamLeader) {
        //   const hasTeamLeader = currentVolunteersInShift.some(vid => volunteers.find(v => v.id === vid)?.isTeamLeader);
        //   if (hasTeamLeader) {
        //     toast.error(`Já existe um líder de equipe neste turno.`);
        //     return;
        //   }
        // }
    }

    setAllocations(prev => {
      const newAllocations = JSON.parse(JSON.stringify(prev)); // Deep copy
      const originShiftId = findShiftOfVolunteer(volunteerId, newAllocations);

      // 1. Remover o voluntário da sua localização original (se houver)
      if (originShiftId) {
        newAllocations[originShiftId] = newAllocations[originShiftId].filter((id: string) => id !== volunteerId);
      }
      
      // 2. Adicionar o voluntário ao novo turno
      // A área "droppable" da lista de disponíveis terá um ID especial
      if (targetShiftId !== "available-volunteers") {
          if (!newAllocations[targetShiftId]) {
            newAllocations[targetShiftId] = [];
          }
          if (!newAllocations[targetShiftId].includes(volunteerId)) {
            newAllocations[targetShiftId].push(volunteerId);
          }
      }

      return newAllocations;
    });
  };

  const allocatedVolunteerIds = new Set(Object.values(allocations).flat());
  const availableVolunteers = volunteers.filter(v => !allocatedVolunteerIds.has(v.id));

  const uniqueDates = [...new Set(shifts.map(s => s.date))].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

  const filteredShifts = shifts.filter(s => {
    const locationMatch = s.location === activeTab;
    const dateMatch = dateFilter === 'all' || s.date === dateFilter;
    const periodMatch = periodFilter === 'all' || s.periodName === periodFilter;
    return locationMatch && dateMatch && periodMatch;
  });
  
  const handleClearFilters = () => {
    setDateFilter('all');
    setPeriodFilter('all');
  }

  const getHumanReadableDate = (dateString: string) => {
    // Adiciona T00:00:00 para evitar problemas com fuso horário na interpretação da data
    const date = new Date(`${dateString}T00:00:00`);
    const formattedDate = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { 
        locale: ptBR,
        timeZone: 'America/Sao_Paulo' // Força um fuso para consistência
    });
    // Capitaliza a primeira letra do dia da semana e do mês
    return formattedDate.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  }

  const getHumanReadableShiftTitle = (shift: Shift) => {
    const date = new Date(`${shift.date}T00:00:00`);
    const dayOfWeek = format(date, "EEEE", { 
        locale: ptBR,
        timeZone: 'America/Sao_Paulo'
    });

    const title = `${shift.location} - ${dayOfWeek}-${shift.periodName}`;
    return title.replace(/(^\w|-\w)/g, m => m.toUpperCase());
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Alocação de Voluntários</h1>
        <button
          onClick={handleAutoAllocate}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Distribuir Automaticamente
        </button>
      </div>
      <p className="mb-8">Arraste os voluntários da lista para os turnos desejados ou use a distribuição automática.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna de Voluntários */}
        <ShiftDroppable id="available-volunteers">
            <div className="md:col-span-1 p-4 bg-gray-100 rounded-lg h-fit">
            <h2 className="text-xl font-semibold mb-4 text-center">Voluntários Disponíveis</h2>
            <div className="space-y-2">
              {availableVolunteers.map(volunteer => (
                <VolunteerDraggable key={volunteer.id} id={volunteer.id}>
                  <div className="p-2 bg-white rounded shadow cursor-grab flex items-center gap-3">
                    <Avatar volunteer={volunteer} />
                    <div>
                        <p className="font-medium">{volunteer.name}</p>
                        <p className="text-sm text-gray-600">{volunteer.congregation}</p>
                    </div>
                  </div>
                </VolunteerDraggable>
              ))}
              {availableVolunteers.length === 0 && volunteers.length > 0 && <p className="text-center text-gray-500">Todos os voluntários foram alocados.</p>}
              {volunteers.length === 0 && <p className="text-center text-gray-500">Nenhum voluntário cadastrado.</p>}
            </div>
            </div>
        </ShiftDroppable>

        {/* Coluna de Turnos */}
        <div className="md:col-span-2 p-4 bg-gray-100 rounded-lg">
          <div className="flex border-b mb-4">
            <button 
                onClick={() => setActiveTab('portaria')}
                className={`py-2 px-4 font-semibold ${activeTab === 'portaria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
                Portaria
            </button>
            <button 
                onClick={() => setActiveTab('patio')}
                className={`py-2 px-4 font-semibold ${activeTab === 'patio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
                Pátio
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Filtrar por:</h3>
            <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border rounded border-gray-300"
            >
                <option value="all">Todas as Datas</option>
                {uniqueDates.map(date => (
                    <option key={date} value={date}>{format(new Date(`${date}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })}</option>
                ))}
            </select>
            <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="p-2 border rounded border-gray-300"
            >
                <option value="all">Todos os Períodos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
            </select>
            <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Limpar Filtros
            </button>
          </div>

          <SortableContext items={filteredShifts.map(s => s.id)}>
            <div className="space-y-4">
              {filteredShifts.map(shift => (
                <SortableShiftItem key={shift.id} id={shift.id}>
                    <ShiftDroppable id={shift.id}>
                        <div className="p-4 bg-white rounded shadow">
                          <div className="font-bold capitalize">{getHumanReadableShiftTitle(shift)}</div>
                          <div className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</div>
                          <div className="mt-2 p-2 border-dashed border-2 rounded-md min-h-[60px] space-y-1">
                            {(allocations[shift.id] || []).map(volunteerId => {
                              const volunteer = volunteers.find(v => v.id === volunteerId);
                              return volunteer ? (
                                <VolunteerDraggable key={volunteer.id} id={volunteer.id}>
                                  <div className="p-2 bg-blue-100 rounded text-sm cursor-grab flex items-center gap-2">
                                    <Avatar volunteer={volunteer} />
                                    <span>{volunteer.name}</span>
                                    {volunteer.isTeamLeader && <span title="Líder de Equipe"><Star size={14} className="text-yellow-500" /></span>}
                                  </div>
                                </VolunteerDraggable>
                              ) : null;
                            })}
                          </div>
                        </div>
                    </ShiftDroppable>
                </SortableShiftItem>
              ))}
              {filteredShifts.length === 0 && <p className="text-center text-gray-500 mt-4">Nenhum turno cadastrado para este local.</p>}
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  )
} 