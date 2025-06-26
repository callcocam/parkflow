import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift, Captain } from "../types";
import { format } from 'date-fns';
import { Share2 } from 'lucide-react';

type CaptainsContext = {
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
    setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>;
}

export function Captains() {
    const { volunteers, shifts, allocations, captains, setCaptains } = useOutletContext<CaptainsContext>();

    // Agrupar turnos por data apenas (um capitão por dia)
    const groups = shifts.reduce((acc, shift) => {
        const key = shift.date;
        if (!acc[key]) {
            acc[key] = { date: shift.date, shifts: [] };
        }
        acc[key].shifts.push(shift);
        return acc;
    }, {} as Record<string, { date: string, shifts: Shift[] }>);

    const handleSetCaptain = (date: string, volunteerId: string) => {
        setCaptains((prev: any) => {
            const otherCaptains = prev.filter((c: Captain) => c.date !== date);
            if (volunteerId) { // Se um voluntário foi selecionado
                return [...otherCaptains, { date, location: 'portaria', volunteerId }]; // location é obrigatório mas não importa aqui
            }
            return otherCaptains; // Se "Nenhum" foi selecionado
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Designar Capitães</h1>
                    <p className="mt-2">Selecione um capitão para cada dia dentre os voluntários escalados.</p>
                </div>
                <button
                    onClick={() => window.open('/escala-publica', '_blank')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Share2 size={16} />
                    Escala Pública
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(groups).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(group => {
                    const shiftsInGroup = group.shifts.map(s => s.id);
                    const volunteerIdsInGroup = new Set(shiftsInGroup.flatMap(sid => allocations[sid] || []));
                    const eligibleVolunteers = volunteers.filter(v => volunteerIdsInGroup.has(v.id));
                    const currentCaptain = captains.find(c => c.date === group.date);

                    // Determinar o dia da semana - usando formato ISO para evitar problemas de fuso horário
                    const dayOfWeek = new Date(`${group.date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
                    const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

                    return (
                        <div key={group.date} className="p-4 bg-white rounded-lg shadow">
                            <h3 className="font-bold text-lg">{dayName}</h3>
                            <p className="text-sm text-gray-600 mb-4">{format(new Date(`${group.date}T12:00:00`), 'dd/MM/yyyy')}</p>
                            
                            <label htmlFor={`captain-select-${group.date}`} className="block text-sm font-medium text-gray-700">Capitão:</label>
                            <select
                                id={`captain-select-${group.date}`}
                                value={currentCaptain?.volunteerId || ""}
                                onChange={(e) => handleSetCaptain(group.date, e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                disabled={eligibleVolunteers.length === 0}
                            >
                                <option value="">Nenhum</option>
                                {eligibleVolunteers.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            {eligibleVolunteers.length === 0 && <p className="text-xs text-red-500 mt-1">Nenhum voluntário alocado para este dia.</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 