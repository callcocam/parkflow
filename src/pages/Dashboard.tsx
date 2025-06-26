import { useOutletContext } from "react-router-dom";
import { useRef } from "react";
import type { Volunteer, Shift, Captain } from "../types";
import { format, isAfter, startOfToday, addDays, isBefore } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

type DashboardContext = {
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
    captains: Captain[];
    setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
    setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>;
}

const StatCard = ({ title, value, description }: { title: string, value: string | number, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
);


export function Dashboard() {
    const { volunteers, shifts, allocations, captains, setVolunteers, setShifts, setAllocations, setCaptains } = useOutletContext<DashboardContext>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Função para exportar dados para JSON
    const exportToJSON = () => {
        const data = {
            volunteers,
            shifts,
            allocations,
            captains,
            exportDate: new Date().toISOString(),
            version: "1.0"
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `parkflow-backup-${format(new Date(), 'dd-MM-yyyy-HH-mm')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Backup exportado com sucesso!');
    };

    // Função para importar dados do JSON
    const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // Validar estrutura básica
                if (!data.volunteers || !data.shifts || !data.allocations) {
                    throw new Error('Arquivo JSON inválido: estrutura de dados incorreta');
                }

                // Confirmar importação
                const confirmImport = window.confirm(
                    `Tem certeza que deseja importar este backup?\n\n` +
                    `Data do backup: ${data.exportDate ? format(new Date(data.exportDate), 'dd/MM/yyyy HH:mm') : 'Desconhecida'}\n` +
                    `Voluntários: ${data.volunteers.length}\n` +
                    `Turnos: ${data.shifts.length}\n` +
                    `Alocações: ${Object.values(data.allocations).flat().length}\n` +
                    `Capitães: ${data.captains?.length || 0}\n\n` +
                    `ATENÇÃO: Todos os dados atuais serão substituídos!`
                );

                if (confirmImport) {
                    // Atualizar todos os estados
                    setVolunteers(data.volunteers);
                    setShifts(data.shifts);
                    setAllocations(data.allocations);
                    setCaptains(data.captains || []);

                    // Atualizar localStorage diretamente
                    localStorage.setItem('volunteers', JSON.stringify(data.volunteers));
                    localStorage.setItem('shifts', JSON.stringify(data.shifts));
                    localStorage.setItem('allocations', JSON.stringify(data.allocations));
                    localStorage.setItem('captains', JSON.stringify(data.captains || []));

                    toast.success('Backup importado com sucesso!');
                }
            } catch (error) {
                console.error('Erro ao importar JSON:', error);
                toast.error('Erro ao importar arquivo: ' + (error instanceof Error ? error.message : 'Formato inválido'));
            }
        };
        reader.readAsText(file);
        
        // Limpar input para permitir reimportar o mesmo arquivo
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const totalAllocations = Object.values(allocations).flat().length;

    const congregationCounts = volunteers.reduce((acc, volunteer) => {
        acc[volunteer.congregation] = (acc[volunteer.congregation] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const congregationData = Object.entries(congregationCounts).map(([name, count]) => ({
        name,
        voluntários: count
    }));

    const today = startOfToday();
    const nextSevenDays = addDays(today, 7);
    const upcomingShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.date);
        return isAfter(shiftDate, today) && isBefore(shiftDate, nextSevenDays);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex gap-3">
                    <button
                        onClick={exportToJSON}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Exportar Backup
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={importFromJSON}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Upload size={16} />
                        Importar Backup
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total de Voluntários" value={volunteers.length} description="Voluntários cadastrados" />
                <StatCard title="Total de Turnos" value={shifts.length} description="Turnos criados" />
                <StatCard title="Alocações Realizadas" value={totalAllocations} description="Vagas de voluntários preenchidas" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Voluntários por Congregação</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={congregationData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="voluntários" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Próximos Turnos (7 dias)</h2>
                    <div className="space-y-4">
                        {upcomingShifts.length > 0 ? (
                            upcomingShifts.slice(0, 5).map(shift => (
                                <div key={shift.id} className="p-3 bg-gray-50 rounded-md border">
                                    <p className="font-semibold">{shift.location} - {format(new Date(shift.date), 'dd/MM/yyyy')}</p>
                                    <p className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Nenhum turno agendado para os próximos 7 dias.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 