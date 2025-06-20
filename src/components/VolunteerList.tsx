import type { Volunteer } from "../types";
import { Trash2, Star } from "lucide-react";

interface VolunteerListProps {
    volunteers: Volunteer[];
    onDeleteVolunteer: (id: string) => void;
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
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {getInitials(volunteer.name)}
        </div>
    )
}

export function VolunteerList({ volunteers, onDeleteVolunteer }: VolunteerListProps) {
    if (volunteers.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Nenhum voluntário cadastrado ainda.</p>;
    }

    return (
        <div className="overflow-x-auto mt-8">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-3 px-6 text-left"></th>
                        <th className="py-3 px-4 text-left">Nome</th>
                        <th className="py-3 px-4 text-left">Telefone</th>
                        <th className="py-3 px-4 text-left">Congregação</th>
                        <th className="py-3 px-4 text-left">Cidade</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {volunteers.map((volunteer) => (
                        <tr key={volunteer.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-6">
                                <Avatar volunteer={volunteer} />
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    {volunteer.isTeamLeader && 
                                        <span title="Líder de Equipe">
                                            <Star size={16} className="text-yellow-500" />
                                        </span>
                                    }
                                    <span>{volunteer.name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">{volunteer.phone}</td>
                            <td className="py-3 px-4">{volunteer.congregation}</td>
                            <td className="py-3 px-4">{volunteer.city}</td>
                            <td className="py-3 px-4 text-center">
                                <button
                                    onClick={() => onDeleteVolunteer(volunteer.id)}
                                    className="text-red-600 hover:text-red-800"
                                    aria-label={`Excluir ${volunteer.name}`}
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