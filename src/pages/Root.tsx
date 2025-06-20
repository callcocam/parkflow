import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import type { Volunteer, Shift, Captain } from "../types";
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const seedVolunteers: Volunteer[] = [
  { id: 'seed-1', name: 'Tiago Davila Jaques Da Silva', phone: '51998590784', congregation: 'Sul de sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-2', name: 'Vitor Rodrigues', phone: '51994666754', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-3', name: 'Pablo Souza', phone: '51995041242', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-4', name: 'José Jardim', phone: '51991943016', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-5', name: 'Jonas Cristian Machado', phone: '5198579854', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-6', name: 'Maicon Antunes', phone: '51999466628', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-7', name: 'Loamy Andrew Perez da Silva', phone: '51983333889', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-8', name: 'Hiury Natan Cheruti', phone: '51989280148', congregation: 'Araricá', city: 'Araricá', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-9', name: 'Israel da Silva Rodrigues', phone: '51998753352', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-10', name: 'Juliano Nolibus Fernandes', phone: '51997308743', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-11', name: 'Daniel jordan dos Santos Antunes', phone: '51984284571', congregation: 'Sul Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-12', name: 'Roberson Pereira Lange', phone: '51995751088', congregation: 'Capão Novo', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-13', name: 'Kaue silveira', phone: '51996538590', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-14', name: 'Luis Henrique Custódio Strapação', phone: '51980450397', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-15', name: 'Felipe Lermen', phone: '51998364443', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-16', name: 'Yuri Francisco Pereira', phone: '51980115423', congregation: 'Central', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-17', name: 'Cauã Soares', phone: '51994160395', congregation: 'N/A', city: 'Santo Antônio da Patrulha', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-18', name: 'Vanderlei Fontana', phone: '51996088629', congregation: 'Maquiné', city: 'Maquiné', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-19', name: 'Raphael Oliveira Almeida', phone: '51981621967', congregation: 'Central Capão Da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-20', name: 'Albeneir da silva', phone: '51998535105', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-21', name: 'Jonas Guilherme de Paulo dos Santos', phone: '51996561141', congregation: 'Ararica', city: 'Ararica', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-22', name: 'Rafael da Silva Lima', phone: '51992593969', congregation: 'Central de Capão da Canoa', city: 'Capão da Canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-23', name: 'Jair dos Santos de Jesús', phone: '51999430592', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-24', name: 'Fabiano Dinstmann', phone: '51980258822', congregation: 'Central Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-25', name: 'Pedro José de Oliveira Ferreira', phone: '51995266278', congregation: 'santo Antônio da patrulha', city: 'santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-26', name: 'Oilson tadei Luiz', phone: '54999263595', congregation: 'Santo Antônio da patrulha', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-27', name: 'Maico Rolim Dias', phone: '51999430204', congregation: 'SAP', city: 'Santo Antônio da patrulha', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-28', name: 'Osvaldo Renato Braga', phone: '51981599664', congregation: 'Central', city: 'Capão da canoa', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-29', name: 'Geovane Barbosa', phone: '75988242932', congregation: 'Central', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-30', name: 'Gilmar sander', phone: '51998586938', congregation: 'Central', city: 'Campo Bom', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-31', name: 'Valdoni dos Reis', phone: '51995823555', congregation: 'Sul de Sapiranga', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
  { id: 'seed-32', name: 'Sergio Volpi', phone: '51995340686', congregation: 'Sul', city: 'Sapiranga', isTeamLeader: false, imageUrl: '' },
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
  const [shifts, setShifts] = useState<Shift[]>(() => loadFromLocalStorage('shifts', []));
  const [captains, setCaptains] = useState<Captain[]>(() => loadFromLocalStorage('captains', []));
  const [allocations, setAllocations] = useState<Record<string, string[]>>(() => loadFromLocalStorage('allocations', {}));

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

  const handleDeleteVolunteer = (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
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

  const handleAddMultipleShifts = (shiftsToAdd: Shift[]) => {
    const newShiftsWithIds = shiftsToAdd.map(shift => ({ ...shift, id: nanoid() }));
    setShifts((prev) => [...prev, ...newShiftsWithIds]);
  }

  return (
    <div className="flex">
      <Toaster position="top-center" reverseOrder={false} />
      <aside className={`w-56 bg-gray-100 p-4 h-screen fixed top-0 left-0 z-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <nav className="flex flex-col space-y-2">
          <Link to="/" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
          <Link to="/volunteers" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Voluntários</Link>
          <Link to="/shifts" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Turnos</Link>
          <Link to="/allocation" className="text-lg font-semibold hover:text-blue-600" onClick={() => setIsSidebarOpen(false)}>Alocação</Link>
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
          volunteers, handleAddVolunteer, handleDeleteVolunteer, setVolunteers,
          shifts, handleAddShift, handleDeleteShift, setShifts, handleAddMultipleShifts,
          captains, setCaptains,
          allocations, setAllocations
        }} />
      </main>
    </div>
  )
} 