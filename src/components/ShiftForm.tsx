import { useState } from "react";
import type { Shift } from "../types";
import { parse, format, addMinutes, isBefore, startOfToday } from "date-fns";
import toast from 'react-hot-toast';

interface ShiftFormProps {
    onAddMultipleShifts: (shifts: Omit<Shift, 'id'>[]) => void;
}

const periodOptions = {
    'Manhã': { start: '07:00', end: '12:00' },
    'Tarde': { start: '13:00', end: '18:00' },
};

export function ShiftForm({ onAddMultipleShifts }: ShiftFormProps) {
    const [date, setDate] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<'Manhã' | 'Tarde'>('Manhã');
    const [periodDuration, setPeriodDuration] = useState(60);
    const [location, setLocation] = useState<'portaria' | 'patio'>('portaria');
    const [requiredVolunteers, setRequiredVolunteers] = useState(1);

    const validate = () => {
        let isValid = true;
        const today = startOfToday();

        if (!date) {
            toast.error("A data é obrigatória.");
            isValid = false;
        } else if (isBefore(new Date(date), today)) {
            toast.error("A data não pode ser no passado.");
            isValid = false;
        }
        if (periodDuration < 15) {
            toast.error("A duração do período deve ser de no mínimo 15 minutos.");
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const generatedShifts: Omit<Shift, 'id'>[] = [];
        const block = periodOptions[selectedPeriod];
        
        let currentPeriodStart = parse(`${date} ${block.start}`, 'yyyy-MM-dd HH:mm', new Date());
        const blockEndDateTime = parse(`${date} ${block.end}`, 'yyyy-MM-dd HH:mm', new Date());

        while(isBefore(currentPeriodStart, blockEndDateTime)) {
            let currentPeriodEnd = addMinutes(currentPeriodStart, periodDuration);
            
            if(isBefore(blockEndDateTime, currentPeriodEnd)) {
                currentPeriodEnd = blockEndDateTime;
            }

            generatedShifts.push({
                date,
                startTime: format(currentPeriodStart, 'HH:mm'),
                endTime: format(currentPeriodEnd, 'HH:mm'),
                location,
                requiredVolunteers,
                periodName: selectedPeriod
            });

            currentPeriodStart = currentPeriodEnd;
        }

        if (generatedShifts.length > 0) {
            onAddMultipleShifts(generatedShifts);
            toast.success(`${generatedShifts.length} turnos para o período da ${selectedPeriod} foram gerados!`);
            setDate('');
            setPeriodDuration(60);
            setRequiredVolunteers(1);
        } else {
            toast.error("Nenhum turno foi gerado. Verifique a configuração.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 mb-8 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold mb-4">Gerar Turnos por Bloco</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded border-gray-300"
                    title="Data do Bloco"
                />
                 <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'Manhã' | 'Tarde')}
                    className="p-2 border rounded border-gray-300"
                    title="Selecione o Período"
                >
                    <option value="Manhã">Manhã (07:00 - 12:00)</option>
                    <option value="Tarde">Tarde (13:00 - 18:00)</option>
                </select>
                <input
                    type="number"
                    min="15"
                    step="5"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(Number(e.target.value))}
                    className="p-2 border rounded border-gray-300"
                    title="Duração de cada período em minutos"
                />
                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as 'portaria' | 'patio')}
                    className="p-2 border rounded border-gray-300"
                >
                    <option value="portaria">Portaria</option>
                    <option value="patio">Pátio</option>
                </select>
                <input
                    type="number"
                    min="1"
                    value={requiredVolunteers}
                    onChange={(e) => setRequiredVolunteers(Number(e.target.value))}
                    className="p-2 border rounded border-gray-300"
                    title="Voluntários necessários por período"
                />
            </div>
            <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Gerar Turnos
            </button>
        </form>
    );
} 