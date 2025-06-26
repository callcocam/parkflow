import { useOutletContext } from "react-router-dom";
import { ShiftForm } from "../components/ShiftForm";
import { ShiftList } from "../components/ShiftList";
import type { Shift } from "../types";
import { useState } from "react";
import { Share2 } from 'lucide-react';

type ShiftsContext = {
  shifts: Shift[];
  handleDeleteShift: (id: string) => void;
  handleAddMultipleShifts: (shifts: Omit<Shift, 'id'>[]) => void;
}

export function Shifts() {
  const { shifts, handleDeleteShift, handleAddMultipleShifts } = useOutletContext<ShiftsContext>();
  const [activeTab, setActiveTab] = useState<'portaria' | 'patio'>('portaria');
  const [dateFilter, setDateFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'Manhã' | 'Tarde'>('all');

  const filteredShifts = shifts.filter(s => {
    const locationMatch = s.location === activeTab;
    const dateMatch = !dateFilter || s.date === dateFilter;
    const periodMatch = periodFilter === 'all' || s.periodName === periodFilter;
    return locationMatch && dateMatch && periodMatch;
  });

  const handleClearFilters = () => {
    setDateFilter('');
    setPeriodFilter('all');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Turnos</h1>
        <button
          onClick={() => window.open('/escala-publica', '_blank')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Share2 size={16} />
          Escala Pública
        </button>
      </div>
      <ShiftForm onAddMultipleShifts={handleAddMultipleShifts} />

      <div className="mt-8">
        <div className="flex border-b">
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
        
        <div className="flex flex-wrap items-center gap-4 my-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Filtrar por:</h3>
            <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border rounded border-gray-300"
            />
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

        <ShiftList shifts={filteredShifts} onDeleteShift={handleDeleteShift} />
      </div>
    </div>
  );
} 