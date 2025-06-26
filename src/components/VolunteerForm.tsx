import { useState, useEffect } from "react";
import type { Volunteer, Shift } from "../types";
import { isValidBrazilianPhone } from "../lib/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface VolunteerFormProps {
    onAddVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
    onEditVolunteer?: (volunteer: Volunteer) => void;
    existingVolunteers: Volunteer[];
    shifts: Shift[];
    editingVolunteer?: Volunteer | null;
    onCancelEdit?: () => void;
}

export function VolunteerForm({ onAddVolunteer, onEditVolunteer, existingVolunteers, shifts, editingVolunteer, onCancelEdit }: VolunteerFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [congregation, setCongregation] = useState('');
    const [city, setCity] = useState('');
    const [isTeamLeader, setIsTeamLeader] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [unavailableShifts, setUnavailableShifts] = useState<string[]>([]);

    // Efeito para preencher o formulário quando estiver editando
    useEffect(() => {
        if (editingVolunteer) {
            setName(editingVolunteer.name);
            setPhone(editingVolunteer.phone);
            setCongregation(editingVolunteer.congregation);
            setCity(editingVolunteer.city);
            setIsTeamLeader(editingVolunteer.isTeamLeader || false);
            setImageUrl(editingVolunteer.imageUrl);
            setUnavailableShifts(editingVolunteer.unavailableShifts || []);
        } else {
            // Limpar formulário quando não estiver editando
            setName('');
            setPhone('');
            setCongregation('');
            setCity('');
            setIsTeamLeader(false);
            setImageUrl(undefined);
            setUnavailableShifts([]);
        }
    }, [editingVolunteer]);

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
                v => v.id !== editingVolunteer?.id && // Ignorar o próprio voluntário quando editando
                     v.name.trim().toLowerCase() === name.trim().toLowerCase() && 
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
        
        if (editingVolunteer && onEditVolunteer) {
            // Modo edição
            onEditVolunteer({ 
                ...editingVolunteer, 
                name, 
                phone, 
                congregation, 
                city, 
                isTeamLeader, 
                imageUrl,
                unavailableShifts 
            });
            toast.success(`Voluntário ${name} atualizado!`);
        } else {
            // Modo adição
            onAddVolunteer({ name, phone, congregation, city, isTeamLeader, imageUrl, unavailableShifts });
            toast.success(`Voluntário ${name} adicionado!`);
        }
        
        // Limpar formulário
        setName('');
        setPhone('');
        setCongregation('');
        setCity('');
        setIsTeamLeader(false);
        setImageUrl(undefined);
        setUnavailableShifts([]);
    };

    const handleUnavailableShiftChange = (shiftId: string, isChecked: boolean) => {
        if (isChecked) {
            setUnavailableShifts(prev => [...prev, shiftId]);
        } else {
            setUnavailableShifts(prev => prev.filter(id => id !== shiftId));
        }
    };

    const formatShiftDisplay = (shift: Shift) => {
        const [year, month, day] = shift.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const formattedDate = format(date, 'dd/MM (eeee)', { locale: ptBR });
        const location = shift.location === 'portaria' ? 'Portaria' : 'Pátio';
        return `${formattedDate} - ${shift.startTime} às ${shift.endTime} - ${location}`;
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 border rounded-lg bg-white shadow-md">
            {/* Cabeçalho do formulário */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">
                    {editingVolunteer ? '✏️ Editar Voluntário' : '➕ Adicionar Novo Voluntário'}
                </h2>
                {editingVolunteer && onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="w-full sm:w-auto px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        ❌ Cancelar
                    </button>
                )}
            </div>
            
            {/* Grid de campos principais - responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                    </label>
                    <input
                        type="text"
                        placeholder="Digite o nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 sm:p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                    </label>
                    <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 sm:p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Congregação *
                    </label>
                    <input
                        type="text"
                        placeholder="Nome da congregação"
                        value={congregation}
                        onChange={(e) => setCongregation(e.target.value)}
                        className="w-full p-3 sm:p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                    </label>
                    <input
                        type="text"
                        placeholder="Nome da cidade"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-3 sm:p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <div className="flex items-center gap-2 p-3 sm:p-2 bg-gray-50 rounded border">
                     <input
                        type="checkbox"
                        id="isTeamLeader"
                        checked={isTeamLeader}
                        onChange={(e) => setIsTeamLeader(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isTeamLeader" className="font-medium text-gray-700 text-sm">
                        ⭐ Líder de Equipe
                    </label>
                </div>
                
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
                        📷 Foto (opcional)
                    </label>
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                 </div>
            </div>
            
            {/* Seção de horários indisponíveis - responsiva */}
            <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    🕐 Horários Indisponíveis (opcional)
                </label>
                <div className="max-h-32 sm:max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                    {shifts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Nenhum turno cadastrado ainda
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {shifts.map(shift => (
                                <div key={shift.id} className="flex items-start gap-2 p-2 hover:bg-white rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        id={`shift-${shift.id}`}
                                        checked={unavailableShifts.includes(shift.id)}
                                        onChange={(e) => handleUnavailableShiftChange(shift.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                    />
                                    <label htmlFor={`shift-${shift.id}`} className="text-sm text-gray-700 leading-tight cursor-pointer">
                                        {formatShiftDisplay(shift)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {unavailableShifts.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-700">
                            ✅ {unavailableShifts.length} horário(s) marcado(s) como indisponível(is)
                        </p>
                    </div>
                )}
            </div>

            {/* Botão de submit responsivo */}
            <div className="flex justify-end">
                <button 
                    type="submit" 
                    className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {editingVolunteer ? (
                        <>
                            💾 <span className="hidden sm:inline">Atualizar Voluntário</span><span className="sm:hidden">Atualizar</span>
                        </>
                    ) : (
                        <>
                            ➕ <span className="hidden sm:inline">Adicionar Voluntário</span><span className="sm:hidden">Adicionar</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
} 