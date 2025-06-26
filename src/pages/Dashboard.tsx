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
    isReady: boolean;
    usingFallback: boolean;
    exportData: () => Promise<any>;
    importData: (data: any) => Promise<void>;
}

const StatCard = ({ title, value, description }: { title: string, value: string | number, description: string }) => (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium uppercase">{title}</h3>
        <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">{description}</p>
    </div>
);


export function Dashboard() {
    const { volunteers, shifts, allocations, usingFallback, exportData, importData } = useOutletContext<DashboardContext>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Função para exportar dados para JSON usando IndexedDB
    const exportToJSON = async () => {
        try {
            const data = await exportData();
            
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
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            toast.error('Erro ao exportar backup');
        }
    };

    // Função para importar dados do JSON usando IndexedDB
    const importFromJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
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
                    `Capitães: ${data.captains?.length || 0}\n` +
                    `Versão: ${data.version || 'Desconhecida'}\n\n` +
                    `ATENÇÃO: Todos os dados atuais serão substituídos!`
                );

                if (confirmImport) {
                    await importData(data);
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
        <div className="p-2 sm:p-4 lg:p-6">
            {/* Cabeçalho responsivo */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" 
                         style={{
                             backgroundColor: usingFallback ? '#fef3c7' : '#d1fae5',
                             color: usingFallback ? '#92400e' : '#065f46'
                         }}>
                        {usingFallback ? '📦 localStorage' : '🗄️ IndexedDB'}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={exportToJSON}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Exportar Backup</span>
                        <span className="sm:hidden">💾 Exportar</span>
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
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Importar Backup</span>
                        <span className="sm:hidden">📤 Importar</span>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('⚠️ ATENÇÃO: Isso irá:\n\n• Limpar TODOS os dados\n• Remover cache PWA\n• Reiniciar aplicação\n\nConfirma?')) {
                                // Limpar IndexedDB
                                indexedDB.deleteDatabase('parkflow_db');
                                // Limpar localStorage
                                localStorage.clear();
                                // Limpar cache do service worker
                                if ('serviceWorker' in navigator) {
                                    navigator.serviceWorker.getRegistrations().then(registrations => {
                                        registrations.forEach(registration => registration.unregister());
                                    });
                                }
                                // Recarregar página
                                window.location.reload();
                            }
                        }}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                        <span className="hidden sm:inline">🗑️ Reset Completo</span>
                        <span className="sm:hidden">🗑️ Reset</span>
                    </button>
                </div>
            </div>
            
            {/* Grid de estatísticas responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <StatCard title="Total de Voluntários" value={volunteers.length} description="Voluntários cadastrados" />
                <StatCard title="Total de Turnos" value={shifts.length} description="Turnos criados" />
                <StatCard title="Alocações Realizadas" value={totalAllocations} description="Vagas preenchidas" />
            </div>

            {/* Grid principal responsivo */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Gráfico de congregações */}
                <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">
                        📊 Voluntários por Congregação
                    </h2>
                    <div className="w-full h-56 sm:h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={congregationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <XAxis 
                                    dataKey="name" 
                                    fontSize={10}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={50}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        fontSize: '12px',
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '6px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="voluntários" fill="#8884d8" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lista de próximos turnos */}
                <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">
                        📅 Próximos Turnos (7 dias)
                    </h2>
                    <div className="space-y-2 sm:space-y-3 max-h-56 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                        {upcomingShifts.length > 0 ? (
                            upcomingShifts.slice(0, 5).map(shift => (
                                <div key={shift.id} className="p-2 sm:p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm sm:text-base text-gray-800 capitalize">
                                                📍 {shift.location}
                                            </p>
                                            <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                {shift.startTime} - {shift.endTime}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            📆 {format(new Date(shift.date), 'dd/MM/yyyy')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <div className="text-4xl sm:text-5xl mb-2">📅</div>
                                <p className="text-gray-500 text-sm sm:text-base">
                                    Nenhum turno agendado para os próximos 7 dias.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Indicador de mais turnos se houver */}
                    {upcomingShifts.length > 5 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-500 text-center">
                                +{upcomingShifts.length - 5} turnos adicionais nos próximos 7 dias
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 