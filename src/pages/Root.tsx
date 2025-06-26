import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import type { Volunteer, Shift, Captain } from "../types";
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const seedVolunteers: Volunteer[] = [

  { id: 'seed-1', name: 'Tiago Davila Jaques Da Silva', phone: '51998590784', congregation: 'Sul de sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-2', name: 'Vitor Rodrigues', phone: '51994666754', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-3', name: 'Pablo Souza', phone: '51995041242', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-4', name: 'José Jardim', phone: '51991943016', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-5', name: 'Jonas Cristian Machado', phone: '5198579854', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-6', name: 'Maicon Antunes', phone: '51999466628', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-7', name: 'Loamy Andrew Perez da Silva', phone: '51983333889', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-8', name: 'Hiury Natan Cheruti', phone: '51989280148', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-9', name: 'Israel da Silva Rodrigues', phone: '51998753352', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-10', name: 'Juliano Nolibus Fernandes', phone: '51997308743', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-11', name: 'Daniel jordan dos Santos Antunes', phone: '51984284571', congregation: 'Sul Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-12', name: 'Roberson Pereira Lange', phone: '51995751088', congregation: 'Capão Novo', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-13', name: 'Kaue silveira', phone: '51996538590', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-14', name: 'Luis Henrique Custódio Strapação', phone: '51980450397', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-15', name: 'Felipe Lermen', phone: '51998364443', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-16', name: 'Yuri Francisco Pereira', phone: '51980115423', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-17', name: 'Cauã Soares', phone: '51994160395', congregation: 'N/A', city: 'Santo Antônio da Patrulha', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-18', name: 'Vanderlei Fontana', phone: '51996088629', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-19', name: 'Raphael Oliveira Almeida', phone: '51981621967', congregation: 'Central Capão Da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-20', name: 'Albeneir da silva', phone: '51998535105', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '', unavailableShifts: [] },
  { id: 'seed-21', name: 'Jonas Guilherme de Paulo dos Santos', phone: '51996561141', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-22', name: 'Rafael da Silva Lima', phone: '51992593969', congregation: 'Central de Capão da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-23', name: 'Jair dos Santos de Jesús', phone: '51999430592', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-24', name: 'Fabiano Dinstmann', phone: '51980258822', congregation: 'Central Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-25', name: 'Pedro José de Oliveira Ferreira', phone: '51995266278', congregation: 'santo Antônio da patrulha', city: 'santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-26', name: 'Oilson tadei Luiz', phone: '54999263595', congregation: 'Santo Antônio da patrulha', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-27', name: 'Maico Rolim Dias', phone: '51999430204', congregation: 'SAP', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-28', name: 'Osvaldo Renato Braga', phone: '51981599664', congregation: 'Central', city: 'Capão da canoa', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-29', name: 'Geovane Barbosa', phone: '75988242932', congregation: 'Central', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-30', name: 'Gilmar sander', phone: '51998586938', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-31', name: 'Valdoni dos Reis', phone: '51995823555', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-32', name: 'Sergio Volpi', phone: '51995340686', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-33', name: 'Alessandro Campos', phone: '51999999999', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-34', name: 'Cláudio', phone: '51999999999', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-35', name: 'Érico', phone: '51999999999', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-36', name: 'Marlison', phone: '51999999999', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' , unavailableShifts: [] },
  { id: 'seed-37', name: 'Rubervan', phone: '51999999999', congregation: 'Central', city: 'Central', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-38', name: 'Sexta Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Sexta', city: 'Sexta', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-39', name: 'Sexta Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Sexta', city: 'Sexta', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-40', name: 'Sábado Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Sábado', city: 'Sábado', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-41', name: 'Sábado Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Sábado', city: 'Sábado', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-42', name: 'Domingo Manhã - Todos os voluntários', phone: '51999999999', congregation: 'Domingo', city: 'Domingo', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-43', name: 'Domingo Tarde - Todos os voluntários', phone: '51999999999', congregation: 'Domingo', city: 'Domingo', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-44', name: 'Egmar Antonio Rahmeier', phone: '51985485174', congregation: 'Sul', city: 'Sul', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},
  { id: 'seed-45', name: 'Evonir Boeira', phone: '51984849188', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '' , unavailableShifts: []},


];

// Períodos para os dias 27, 28 e 29 de junho de 2025
const seedShifts: Shift[] = [
  // Dia 27/06/2025 - Manhã Sexta-feira Portaria
  { id: 'shift-27-manha-portaria-1', date: '2025-06-27', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-2', date: '2025-06-27', startTime: '09:00', endTime: '10:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-3', date: '2025-06-27', startTime: '10:30', endTime: '12:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-portaria-4', date: '2025-06-27', startTime: '12:00', endTime: '13:30', location: 'portaria', requiredVolunteers: 4, periodName: 'Manhã' },
  // Dia 27/06/2025 - Tarde Sexta-feira Portaria
  { id: 'shift-27-manha-portaria-5', date: '2025-06-27', startTime: '13:30', endTime: '15:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-tarde-portaria-1', date: '2025-06-27', startTime: '15:00', endTime: '16:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-tarde-portaria-2', date: '2025-06-27', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },

  // Dia 27/06/2025 - Manhã Sexta-feira Patio
  { id: 'shift-27-manha-patio-1', date: '2025-06-27', startTime: '07:00', endTime: '09:00', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-27-manha-patio-2', date: '2025-06-27', startTime: '09:00', endTime: '10:30', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-27-manha-patio-3', date: '2025-06-27', startTime: '10:30', endTime: '12:00', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 27/06/2025 - Tarde Sexta-feira Patio
  { id: 'shift-27-manha-patio-4', date: '2025-06-27', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-manha-patio-5', date: '2025-06-27', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-27-tarde-patio-1', date: '2025-06-27', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },





  // Dia 28/06/2025 - Manhã Sábado Portaria
  { id: 'shift-28-manha-portaria-1', date: '2025-06-28', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-2', date: '2025-06-28', startTime: '09:00', endTime: '10:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-3', date: '2025-06-28', startTime: '10:30', endTime: '12:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-portaria-4', date: '2025-06-28', startTime: '12:00', endTime: '13:30', location: 'portaria', requiredVolunteers: 4, periodName: 'Manhã' },
  // Dia 28/06/2025 - Tarde Sábado Portaria
  { id: 'shift-28-manha-portaria-5', date: '2025-06-28', startTime: '13:30', endTime: '15:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-tarde-portaria-1', date: '2025-06-28', startTime: '15:00', endTime: '16:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-tarde-portaria-2', date: '2025-06-28', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },

  // Dia 28/06/2025 - Manhã Sábado Patio
  { id: 'shift-28-manha-patio-1', date: '2025-06-28', startTime: '07:00', endTime: '09:00', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-28-manha-patio-2', date: '2025-06-28', startTime: '09:00', endTime: '10:30', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-28-manha-patio-3', date: '2025-06-28', startTime: '10:30', endTime: '12:00', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 28/06/2025 - Tarde Sábado Patio
  { id: 'shift-28-manha-patio-4', date: '2025-06-28', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-manha-patio-5', date: '2025-06-28', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-28-manha-patio-6', date: '2025-06-28', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },




  // Dia 29/06/2025 - Manhã Domingo Portaria
  { id: 'shift-29-manha-portaria-1', date: '2025-06-29', startTime: '07:00', endTime: '09:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-2', date: '2025-06-29', startTime: '09:00', endTime: '10:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-3', date: '2025-06-29', startTime: '10:30', endTime: '12:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-portaria-4', date: '2025-06-29', startTime: '12:00', endTime: '13:30', location: 'portaria', requiredVolunteers: 4, periodName: 'Manhã' },
  // Dia 29/06/2025 - Tarde Domingo Portaria
  { id: 'shift-29-manha-portaria-5', date: '2025-06-29', startTime: '13:30', endTime: '15:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-manha-portaria-6', date: '2025-06-29', startTime: '15:00', endTime: '16:30', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-manha-portaria-7', date: '2025-06-29', startTime: '16:30', endTime: '18:00', location: 'portaria', requiredVolunteers: 2, periodName: 'Tarde' },


  // Dia 29/06/2025 - Tarde Domingo Patio

  { id: 'shift-29-manha-patio-1', date: '2025-06-29', startTime: '07:00', endTime: '09:00', location: 'patio', requiredVolunteers: 1, periodName: 'Manhã' },
  { id: 'shift-29-manha-patio-2', date: '2025-06-29', startTime: '09:00', endTime: '10:30', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  { id: 'shift-29-manha-patio-3', date: '2025-06-29', startTime: '10:30', endTime: '12:00', location: 'patio', requiredVolunteers: 2, periodName: 'Manhã' },
  // Dia 29/06/2025 - Tarde Domingo Patio
  { id: 'shift-29-manha-patio-4', date: '2025-06-29', startTime: '13:00', endTime: '14:30', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-manha-patio-5', date: '2025-06-29', startTime: '14:30', endTime: '16:00', location: 'patio', requiredVolunteers: 2, periodName: 'Tarde' },
  { id: 'shift-29-manha-patio-6', date: '2025-06-29', startTime: '16:00', endTime: '17:30', location: 'patio', requiredVolunteers: 1, periodName: 'Tarde' },
];


// Helper para carregar do localStorage
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (error) {
    console.error(`Erro ao carregar '${key}' do localStorage`, error);
  }
  return defaultValue;
}

export function Root() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => loadFromLocalStorage('volunteers', seedVolunteers));
  const [shifts, setShifts] = useState<Shift[]>(() => loadFromLocalStorage('shifts', seedShifts));
  const [captains, setCaptains] = useState<Captain[]>(() => loadFromLocalStorage('captains', []));
  const [allocations, setAllocations] = useState<Record<string, string[]>>(() => loadFromLocalStorage('allocations', {}));
  console.log(allocations)

  // Efeitos para salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('captains', JSON.stringify(captains));
  }, [captains]);

  useEffect(() => {
    localStorage.setItem('allocations', JSON.stringify(allocations));
  }, [allocations]);

  const handleAddVolunteer = (volunteerData: Omit<Volunteer, 'id'>) => {
    const newVolunteer: Volunteer = {
      id: nanoid(),
      ...volunteerData,
    };
    setVolunteers((prev) => [...prev, newVolunteer]);
  };

  const handleEditVolunteer = (updatedVolunteer: Volunteer) => {
    setVolunteers((prev) =>
      prev.map((volunteer) =>
        volunteer.id === updatedVolunteer.id ? updatedVolunteer : volunteer
      )
    );
  };

  const handleDeleteVolunteer = (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleLeader = (id: string) => {
    setVolunteers((prev) =>
      prev.map((volunteer) =>
        volunteer.id === id
          ? { ...volunteer, isTeamLeader: !volunteer.isTeamLeader }
          : volunteer
      )
    );
  };

  const handleAddShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      id: nanoid(),
      ...shiftData,
    };
    setShifts((prev) => [...prev, newShift]);
  };

  const handleDeleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };
 

  // Função para alocar automaticamente os voluntários correspondentes nos primeiros e últimos turnos do pátio
  const autoAllocatePatioShifts = () => {
    const patioShiftsWithAllVolunteers = shifts.filter(shift =>
      shift.location === 'patio' && shift.requiredVolunteers === 1
    );

    if (patioShiftsWithAllVolunteers.length > 0) {
      const newAllocations = { ...allocations };

      patioShiftsWithAllVolunteers.forEach(shift => {
        // Determinar qual voluntário específico alocar baseado na data e horário
        let volunteerToAllocate = null;

        if (shift.date === '2025-06-27') { // Sexta-feira
          if (shift.startTime === '07:00') {
            // Primeiro turno da sexta - "Sexta Manhã - Todos os voluntários"
            volunteerToAllocate = volunteers.find(v => v.name.includes('Sexta Manhã - Todos os voluntários'));
          } else if (shift.startTime === '16:00') {
            // Último turno da sexta - "Sexta Tarde - Todos os voluntários"  
            volunteerToAllocate = volunteers.find(v => v.name.includes('Sexta Tarde - Todos os voluntários'));
          }
        } else if (shift.date === '2025-06-28') { // Sábado
          if (shift.startTime === '07:00') {
            // Primeiro turno do sábado - "Sábado Manhã - Todos os voluntários"
            volunteerToAllocate = volunteers.find(v => v.name.includes('Sábado Manhã - Todos os voluntários'));
          } else if (shift.startTime === '16:00') {
            // Último turno do sábado - "Sábado Tarde - Todos os voluntários"
            volunteerToAllocate = volunteers.find(v => v.name.includes('Sábado Tarde - Todos os voluntários'));
          }
        } else if (shift.date === '2025-06-29') { // Domingo
          if (shift.startTime === '07:00') {
            // Primeiro turno do domingo - "Domingo Manhã - Todos os voluntários"
            volunteerToAllocate = volunteers.find(v => v.name.includes('Domingo Manhã - Todos os voluntários'));
          } else if (shift.startTime === '16:00') {
            // Último turno do domingo - "Domingo Tarde - Todos os voluntários"
            volunteerToAllocate = volunteers.find(v => v.name.includes('Domingo Tarde - Todos os voluntários'));
          }
        }

        // Alocar o voluntário específico se encontrado
        if (volunteerToAllocate) {
          newAllocations[shift.id] = [volunteerToAllocate.id];
        }
      });

      setAllocations(newAllocations);
      console.log('Alocação automática dos turnos do pátio concluída!');
    }
  };

  // Executar a alocação automática quando os dados estiverem carregados
  useEffect(() => {
    if (volunteers.length > 0 && shifts.length > 0) {
      autoAllocatePatioShifts();
    }
  }, [volunteers.length, shifts.length]); // Executa quando volunteers e shifts estão disponíveis

  return (
    <div className="flex">
      <Toaster position="top-center" reverseOrder={false} />
      <aside className={`w-56 bg-gray-100 p-4 h-screen fixed top-0 left-0 z-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <nav className="flex flex-col space-y-2">
          <Link to="/" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
          <Link to="/volunteers" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Voluntários</Link>
          <Link to="/shifts" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Turnos</Link>
          <Link to="/allocation" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Alocação Drag&Drop</Link>
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
          allocations, setAllocations
        }} />
      </main>
    </div>
  )
} 