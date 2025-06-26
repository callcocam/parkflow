import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { nanoid } from "nanoid";
import type { Volunteer, Shift } from "../types";
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { useIndexedDB } from '../hooks/useIndexedDB';

const seedVolunteers: Volunteer[] = [
  { id: 'seed-1', name: 'Tiago Davila Jaques Da Silva', phone: '51998590784', congregation: 'Sul de sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-2', name: 'Vitor Rodrigues', phone: '51994666754', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-27-tarde-patio-1', 'shift-27-manha-patio-5', 'shift-27-manha-patio-4', 'shift-27-tarde-portaria-2', 'shift-27-manha-portaria-5', 'shift-27-manha-portaria-4'] },
  { id: 'seed-3', name: 'Pablo Souza', phone: '51995041242', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-4', name: 'José Jardim', phone: '51991943016', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-27-manha-portaria-4', 'shift-27-manha-portaria-5', 'shift-27-tarde-portaria-2', 'shift-27-manha-patio-4', 'shift-27-manha-patio-5', 'shift-27-tarde-patio-1'] },
  { id: 'seed-5', name: 'Jonas Cristian Machado', phone: '5198579854', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-27-manha-portaria-4', 'shift-27-manha-portaria-5', 'shift-27-tarde-portaria-2', 'shift-27-manha-patio-5', 'shift-27-tarde-patio-1', 'shift-27-manha-patio-4', 'shift-28-manha-portaria-4', 'shift-28-manha-portaria-5', 'shift-28-tarde-portaria-2', 'shift-29-manha-portaria-3', 'shift-29-manha-portaria-4', 'shift-29-manha-portaria-5', 'shift-29-tarde-portaria-2', 'shift-29-tarde-patio-1', 'shift-29-manha-patio-5', 'shift-29-manha-patio-4', 'shift-28-manha-patio-5', 'shift-28-manha-patio-4', 'shift-28-tarde-patio-1'] },
  { id: 'seed-6', name: 'Maicon Antunes', phone: '51999466628', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-7', name: 'Loamy Andrew Perez da Silva', phone: '51983333889', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-8', name: 'Hiury Natan Cheruti', phone: '51989280148', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-9', name: 'Israel da Silva Rodrigues', phone: '51998753352', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-27-tarde-portaria-2', 'shift-27-manha-portaria-5', 'shift-27-manha-portaria-4', 'shift-27-tarde-patio-1', 'shift-27-manha-patio-5', 'shift-27-manha-patio-4'] },
  { id: 'seed-10', name: 'Juliano Nolibus Fernandes', phone: '51997308743', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-11', name: 'Daniel jordan dos Santos Antunes', phone: '51984284571', congregation: 'Sul Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-12', name: 'Roberson Pereira Lange', phone: '51995751088', congregation: 'Capão Novo', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-13', name: 'Kaue silveira', phone: '51996538590', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: ['shift-29-manha-patio-2', 'shift-27-manha-portaria-3', 'shift-29-manha-portaria-3', 'shift-29-manha-portaria-4', 'shift-28-manha-portaria-4', 'shift-28-manha-portaria-3', 'shift-27-manha-patio-4', 'shift-27-manha-patio-2'] },
  { id: 'seed-14', name: 'Luis Henrique Custódio Strapação', phone: '51980450397', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-15', name: 'Felipe Lermen', phone: '51998364443', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-16', name: 'Yuri Francisco Pereira', phone: '51980115423', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-17', name: 'Cauã Soares', phone: '51994160395', congregation: 'N/A', city: 'Santo Antônio da Patrulha', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-18', name: 'Vanderlei Fontana', phone: '51996088629', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-19', name: 'Raphael Oliveira Almeida', phone: '51981621967', congregation: 'Central Capão Da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-20', name: 'Albeneir da silva', phone: '51998535105', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-21', name: 'Jonas Guilherme de Paulo dos Santos', phone: '51996561141', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-22', name: 'Rafael da Silva Lima', phone: '51992593969', congregation: 'Central de Capão da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-23', name: 'Jair dos Santos de Jesús', phone: '51999430592', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-24', name: 'Fabiano Dinstmann', phone: '51980258822', congregation: 'Central Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-25', name: 'Pedro José de Oliveira Ferreira', phone: '51995266278', congregation: 'santo Antônio da patrulha', city: 'santo Antônio da patrulha', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-26', name: 'Oilson tadei Luiz', phone: '54999263595', congregation: 'Santo Antônio da patrulha', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-27', name: 'Maico Rolim Dias', phone: '51999430204', congregation: 'SAP', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-28', name: 'Osvaldo Renato Braga', phone: '51981599664', congregation: 'Central', city: 'Capão da canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-29', name: 'Geovane Barbosa', phone: '75988242932', congregation: 'Central', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-30', name: 'Gilmar sander', phone: '51998586938', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-31', name: 'Valdoni dos Reis', phone: '51995823555', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-32', name: 'Sergio Volpi', phone: '51995340686', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-33', name: 'Alessandro Campos', phone: '51999999999', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-34', name: 'Cláudio', phone: '51999999999', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-35', name: 'Érico', phone: '51999999999', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-36', name: 'Marlison', phone: '51999999999', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-37', name: 'Rubervan', phone: '51999999999', congregation: 'Central', city: 'Central', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-38', name: 'Sexta Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Sexta', city: 'Sexta', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-39', name: 'Sexta Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Sexta', city: 'Sexta', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-40', name: 'Sábado Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Sábado', city: 'Sábado', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-41', name: 'Sábado Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Sábado', city: 'Sábado', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-42', name: 'Domingo Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Domingo', city: 'Domingo', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-43', name: 'Domingo Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Domingo', city: 'Domingo', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-44', name: 'Egmar Antonio Rahmeier', phone: '51985485174', congregation: 'Sul', city: 'Sul', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-45', name: 'Evonir Boeira', phone: '51984849188', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] }
];

// Períodos para os dias 27, 28 e 29 de junho de 2025
const seedShifts: Shift[] = [
  // Dia 27/06/2025 - Manhã Sexta-feira Portaria
  { id: 'shift-27-manha-portaria-1', date: '2025-06-27', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-2', date: '2025-06-27', startTime: '09:00', endTime: '10:45', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-3', date: '2025-06-27', startTime: '10:45', endTime: '12:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-4', date: '2025-06-27', startTime: '12:30', endTime: '14:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 27/06/2025 - Tarde Sexta-feira Portaria
  { id: 'shift-27-manha-portaria-5', date: '2025-06-27', startTime: '14:00', endTime: '16:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-tarde-portaria-2', date: '2025-06-27', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 1, periodName: 'Tarde' },

  // Dia 27/06/2025 - Manhã Sexta-feira Patio
  { id: 'shift-27-manha-patio-1', date: '2025-06-27', startTime: '07:00', endTime: '09:45', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-27-manha-patio-2', date: '2025-06-27', startTime: '09:45', endTime: '11:45', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 27/06/2025 - Tarde Sexta-feira Patio
  { id: 'shift-27-manha-patio-4', date: '2025-06-27', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-manha-patio-5', date: '2025-06-27', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-tarde-patio-1', date: '2025-06-27', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },



  // Dia 28/06/2025 - Manhã Sabado Portaria
  { id: 'shift-28-manha-portaria-1', date: '2025-06-28', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-2', date: '2025-06-28', startTime: '09:00', endTime: '10:45', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-3', date: '2025-06-28', startTime: '10:45', endTime: '12:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-4', date: '2025-06-28', startTime: '12:30', endTime: '14:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 28/06/2025 - Tarde Sabado Portaria
  { id: 'shift-28-manha-portaria-5', date: '2025-06-28', startTime: '14:00', endTime: '16:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-tarde-portaria-2', date: '2025-06-28', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 1, periodName: 'Tarde' },

  // Dia 28/06/2025 - Manhã Sabado Patio
  { id: 'shift-28-manha-patio-1', date: '2025-06-28', startTime: '07:00', endTime: '09:45', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-28-manha-patio-2', date: '2025-06-28', startTime: '09:45', endTime: '11:45', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 28/06/2025 - Tarde Sabado Patio
  { id: 'shift-28-manha-patio-4', date: '2025-06-28', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-manha-patio-5', date: '2025-06-28', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-tarde-patio-1', date: '2025-06-28', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },




  // Dia 29/06/2025 - Manhã Domingo Portaria
  { id: 'shift-29-manha-portaria-1', date: '2025-06-29', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-2', date: '2025-06-29', startTime: '09:00', endTime: '10:45', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-3', date: '2025-06-29', startTime: '10:45', endTime: '12:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-4', date: '2025-06-29', startTime: '12:30', endTime: '14:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 29/06/2025 - Tarde Domingo Portaria
  { id: 'shift-29-manha-portaria-5', date: '2025-06-29', startTime: '14:00', endTime: '16:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-tarde-portaria-2', date: '2025-06-29', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },

  // Dia 29/06/2025 - Manhã Domingo Patio
  { id: 'shift-29-manha-patio-1', date: '2025-06-29', startTime: '07:00', endTime: '09:45', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-29-manha-patio-2', date: '2025-06-29', startTime: '09:45', endTime: '11:45', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 29/06/2025 - Tarde Domingo Patio
  { id: 'shift-29-manha-patio-4', date: '2025-06-29', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-manha-patio-5', date: '2025-06-29', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-tarde-patio-1', date: '2025-06-29', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },
];

// Alocações padrão
const seedAllocations: Record<string, string[]> = {
  "shift-27-manha-patio-1": ["seed-38"],
  "shift-27-tarde-patio-1": ["seed-39"],
  "shift-28-manha-patio-1": ["seed-40"],
  "shift-28-tarde-patio-1": ["seed-41"],
  "shift-29-manha-patio-1": ["seed-42"],
  "shift-29-tarde-patio-1": ["seed-43"],
  "shift-27-manha-portaria-2": ["seed-2", "seed-1"],
  "shift-27-manha-portaria-3": ["seed-3", "seed-4"],
  "shift-27-manha-patio-2": ["seed-6", "seed-5"],
  "shift-27-manha-portaria-4": ["seed-7", "seed-8"],
  "shift-28-manha-portaria-2": ["seed-9", "seed-10"],
  "shift-27-manha-portaria-5": ["seed-11", "seed-12"],
  "shift-27-tarde-portaria-2": ["seed-35"],
  "shift-27-manha-patio-5": ["seed-13", "seed-17"],
  "shift-29-manha-patio-2": ["seed-14", "seed-22"],
  "shift-27-manha-patio-4": ["seed-15", "seed-16"],
  "shift-28-manha-portaria-1": ["seed-18"],
  "shift-28-manha-portaria-3": ["seed-19", "seed-25"],
  "shift-29-manha-portaria-4": ["seed-20", "seed-23"],
  "shift-28-manha-patio-2": ["seed-21", "seed-30"],
  "shift-29-manha-portaria-3": ["seed-24", "seed-45"],
  "shift-29-tarde-portaria-2": ["seed-37"],
  "shift-28-manha-portaria-5": ["seed-26", "seed-28"],
  "shift-28-manha-portaria-4": ["seed-27", "seed-29"],
  "shift-27-manha-portaria-1": ["seed-33", "OBpYIDqOXG3DuEfCrcg-n"],
  "shift-28-manha-patio-4": ["MZqej16qdu6HPpzyF0Wzt", "seed-44"],
  "shift-28-tarde-portaria-2": ["seed-34"],
  "shift-29-manha-patio-4": ["seed-36"],
  "shift-29-manha-portaria-1": ["seed-31"]
};

export function Root() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Usar o hook IndexedDB com dados seed
  const {
    volunteers,
    shifts,
    allocations,
    captains,
    isLoading,
    isReady,
    usingFallback,
    isFirebaseConfigured,
    isSyncing,
    lastSyncTime,
    setVolunteers,
    setShifts,
    setAllocations,
    setCaptains,
    addVolunteer: dbAddVolunteer,
    updateVolunteer: dbUpdateVolunteer,
    deleteVolunteer: dbDeleteVolunteer,
    addShift: dbAddShift,
    deleteShift: dbDeleteShift,
    exportData,
    importData,
    configureSync,
    forceSyncToCloud,
    resetSyncConfig
  } = useIndexedDB({
    volunteers: seedVolunteers,
    shifts: seedShifts,
    allocations: seedAllocations,
    captains: []
  });

  console.log('🗄️ IndexedDB Status:', { isReady, usingFallback, volunteerCount: volunteers.length });

  const handleAddVolunteer = async (volunteerData: Omit<Volunteer, 'id'>) => {
    const newVolunteer: Volunteer = {
      id: nanoid(),
      ...volunteerData,
    };
    await dbAddVolunteer(newVolunteer);
  };

  const handleEditVolunteer = async (updatedVolunteer: Volunteer) => {
    await dbUpdateVolunteer(updatedVolunteer);
  };

  const handleDeleteVolunteer = async (id: string) => {
    await dbDeleteVolunteer(id);
  };

  const handleToggleLeader = async (id: string) => {
    const volunteer = volunteers.find(v => v.id === id);
    if (volunteer) {
      const updatedVolunteer = { 
        ...volunteer, 
        isTeamLeader: !volunteer.isTeamLeader 
      };
      await dbUpdateVolunteer(updatedVolunteer);
    }
  };

  const handleAddShift = async (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      id: nanoid(),
      ...shiftData,
    };
    await dbAddShift(newShift);
  };

  const handleDeleteShift = async (id: string) => {
    await dbDeleteShift(id);
  };




  // Executar a alocação automática quando os dados estiverem carregados
  // Comentado pois agora usamos as alocações predefinidas em seedAllocations
  // useEffect(() => {
  //   if (volunteers.length > 0 && shifts.length > 0) {
  //     autoAllocatePatioShifts();
  //   }
  // }, [volunteers.length, shifts.length]); // Executa quando volunteers e shifts estão disponíveis

  // Mostrar loading enquanto IndexedDB não estiver pronto
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Inicializando banco de dados...</p>
          <p className="text-sm text-gray-500">
            {usingFallback ? '📦 Usando localStorage' : '🗄️ Configurando IndexedDB'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Toaster position="top-center" reverseOrder={false} />
      <aside className={`w-56 bg-gray-100 p-4 h-screen fixed top-0 left-0 z-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <nav className="flex flex-col space-y-2">
          <Link to="/" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
          <Link to="/volunteers" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Voluntários</Link>
          <Link to="/shifts" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Turnos</Link>
          <Link to="/allocation" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Visualização das Alocações</Link>
          <Link to="/allocation-select" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Alocação Select</Link>
          <Link to="/captains" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Capitães</Link>
          <Link to="/reports" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Relatórios</Link>
        </nav>
      </aside>
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-10" onClick={() => setIsSidebarOpen(false)}></div>}
      <main className="flex-1 p-8 md:ml-0">
        <Outlet context={{
          volunteers, handleAddVolunteer, handleEditVolunteer, handleDeleteVolunteer, handleToggleLeader, setVolunteers,
          shifts, handleAddShift, handleDeleteShift, setShifts,
          captains, setCaptains,
          allocations, setAllocations,
          isReady, 
          usingFallback,
          isFirebaseConfigured,
          isSyncing,
          lastSyncTime,
          exportData,
          importData,
          configureSync,
          forceSyncToCloud,
          resetSyncConfig,
          handleAddMultipleShifts: async (shiftsToAdd: Shift[]) => {
            const shiftsWithIds = shiftsToAdd.map(shift => ({
              ...shift,
              id: nanoid()
            }));
            const updatedShifts = [...shifts, ...shiftsWithIds];
            await setShifts(updatedShifts);
          }
        }} />
      </main>
    </div>
  )
} 