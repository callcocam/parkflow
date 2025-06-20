import { useOutletContext } from "react-router-dom";
import type { Volunteer, Shift } from "../types";
import { format, isAfter, startOfToday, addDays, isBefore } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DashboardContext = {
    volunteers: Volunteer[];
    shifts: Shift[];
    allocations: Record<string, string[]>;
}

const StatCard = ({ title, value, description }: { title: string, value: string | number, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
);


export function Dashboard() {
    const { volunteers, shifts, allocations } = useOutletContext<DashboardContext>();

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
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
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