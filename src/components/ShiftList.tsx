import type { Shift } from "../types";
import { Trash2 } from "lucide-react";
import { format } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface ShiftListProps {
    shifts: Shift[];
    onDeleteShift: (id: string) => void;
}

export function ShiftList({ shifts, onDeleteShift }: ShiftListProps) {
    if (shifts.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Nenhum turno cadastrado ainda.</p>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(`${dateString}T00:00:00`);
        return format(date, "dd/MM/yyyy (EEEEEE)", { 
            locale: ptBR,
            timeZone: 'America/Sao_Paulo'
        });
    }

    return (
        <div className="overflow-x-auto mt-8">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-3 px-4 text-left">Data</th>
                        <th className="py-3 px-4 text-left">Período</th>
                        <th className="py-3 px-4 text-left">Horário</th>
                        <th className="py-3 px-4 text-left">Local</th>
                        <th className="py-3 px-4 text-left">Voluntários</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {shifts.map((shift) => (
                        <tr key={shift.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(shift.date)}</td>
                            <td className="py-3 px-4">{shift.periodName}</td>
                            <td className="py-3 px-4">{shift.startTime} - {shift.endTime}</td>
                            <td className="py-3 px-4 capitalize">{shift.location}</td>
                            <td className="py-3 px-4">{shift.requiredVolunteers}</td>
                            <td className="py-3 px-4 text-center">
                                <button
                                    onClick={() => onDeleteShift(shift.id)}
                                    className="text-red-600 hover:text-red-800"
                                    aria-label={`Excluir turno de ${shift.date}`}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 