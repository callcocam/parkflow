import { useState } from "react";
import type { Volunteer } from "../types";
import { isValidBrazilianPhone } from "../lib/utils";
import toast from 'react-hot-toast';

interface VolunteerFormProps {
    onAddVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
    existingVolunteers: Volunteer[];
}

export function VolunteerForm({ onAddVolunteer, existingVolunteers }: VolunteerFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [congregation, setCongregation] = useState('');
    const [city, setCity] = useState('');
    const [isTeamLeader, setIsTeamLeader] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const validate = () => {
        let isValid = true;
        if (!name.trim()) {
            toast.error("O nome é obrigatório.");
            isValid = false;
        }
        if (!phone.trim()) {
            toast.error("O telefone é obrigatório.");
            isValid = false;
        } else if (!isValidBrazilianPhone(phone)) {
            toast.error("Formato de telefone inválido.");
            isValid = false;
        }
        if (!congregation.trim()) {
            toast.error("A congregação é obrigatória.");
            isValid = false;
        }
        if (!city.trim()) {
            toast.error("A cidade é obrigatória.");
            isValid = false;
        }
        if (name.trim() && congregation.trim()) {
            const isDuplicate = existingVolunteers.some(
                v => v.name.trim().toLowerCase() === name.trim().toLowerCase() && 
                     v.congregation.trim().toLowerCase() === congregation.trim().toLowerCase()
            );
            if (isDuplicate) {
                toast.error("Este voluntário já está cadastrado para esta congregação.");
                isValid = false;
            }
        }
        return isValid;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        onAddVolunteer({ name, phone, congregation, city, isTeamLeader, imageUrl });
        toast.success(`Voluntário ${name} adicionado!`);
        setName('');
        setPhone('');
        setCongregation('');
        setCity('');
        setIsTeamLeader(false);
        setImageUrl(undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 mb-8 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Novo Voluntário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                <input
                    type="text"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded border-gray-300"
                />
                <input
                    type="text"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded border-gray-300"
                />
                <input
                    type="text"
                    placeholder="Congregação"
                    value={congregation}
                    onChange={(e) => setCongregation(e.target.value)}
                    className="w-full p-2 border rounded border-gray-300"
                />
                <input
                    type="text"
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded border-gray-300"
                />
                <div className="flex items-center gap-2">
                     <input
                        type="checkbox"
                        id="isTeamLeader"
                        checked={isTeamLeader}
                        onChange={(e) => setIsTeamLeader(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isTeamLeader" className="font-medium text-gray-700">Líder de Equipe</label>
                </div>
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                 </div>
            </div>
            <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Adicionar Voluntário
            </button>
        </form>
    );
} 