import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift, Captain } from "../types";
import { format } from 'date-fns';

type CaptainsContext = {
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
    setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>;
}

export function Captains() {
    const { volunteers, shifts, allocations, captains, setCaptains } = useOutletContext<CaptainsContext>();

    // Agrupar turnos por data e local
    const groups = shifts.reduce((acc, shift) => {
        const key = `${shift.date}|${shift.location}`;
        if (!acc[key]) {
            acc[key] = { date: shift.date, location: shift.location, shifts: [] };
        }
        acc[key].shifts.push(shift);
        return acc;
    }, {} as Record<string, { date: string, location: 'portaria' | 'patio', shifts: Shift[] }>);

    const handleSetCaptain = (date: string, location: 'portaria' | 'patio', volunteerId: string) => {
        setCaptains(prev => {
            const otherCaptains = prev.filter(c => !(c.date === date && c.location === location));
            if (volunteerId) { // Se um voluntário foi selecionado
                return [...otherCaptains, { date, location, volunteerId }];
            }
            return otherCaptains; // Se "Nenhum" foi selecionado
        });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Designar Capitães</h1>
            <p className="mt-2 mb-8">Selecione uma data e um local para designar um capitão dentre os voluntários escalados.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(groups).map(group => {
                    const shiftsInGroup = group.shifts.map(s => s.id);
                    const volunteerIdsInGroup = new Set(shiftsInGroup.flatMap(sid => allocations[sid] || []));
                    const eligibleVolunteers = volunteers.filter(v => volunteerIdsInGroup.has(v.id));
                    const currentCaptain = captains.find(c => c.date === group.date && c.location === group.location);

                    return (
                        <div key={`${group.date}-${group.location}`} className="p-4 bg-white rounded-lg shadow">
                            <h3 className="font-bold text-lg capitalize">{group.location}</h3>
                            <p className="text-sm text-gray-600 mb-4">{format(new Date(group.date), 'dd/MM/yyyy')}</p>
                            
                            <label htmlFor={`captain-select-${group.date}-${group.location}`} className="block text-sm font-medium text-gray-700">Capitão:</label>
                            <select
                                id={`captain-select-${group.date}-${group.location}`}
                                value={currentCaptain?.volunteerId || ""}
                                onChange={(e) => handleSetCaptain(group.date, group.location, e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                disabled={eligibleVolunteers.length === 0}
                            >
                                <option value="">Nenhum</option>
                                {eligibleVolunteers.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            {eligibleVolunteers.length === 0 && <p className="text-xs text-red-500 mt-1">Nenhum voluntário alocado para este grupo.</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 