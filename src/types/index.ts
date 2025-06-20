export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  congregation: string;
  city: string;
  isTeamLeader?: boolean;
  imageUrl?: string;
}

export interface Shift {
  id: string;
  date: string; // Formato YYYY-MM-DD
  startTime: string; // Formato HH:mm
  endTime: string; // Formato HH:mm
  location: 'portaria' | 'patio';
  requiredVolunteers: number;
  periodName: string; // Manhã, Tarde, etc.
}

export interface Captain {
  id: string;
  volunteerId: string;
  date: string;
  location: 'portaria' | 'patio';
}

export interface AllocationContext {
  volunteers: Volunteer[];
  shifts: Shift[];
  allocations: Record<string, string[]>;
  captains: Captain[];
  setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  setAllocations: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setCaptains: React.Dispatch<React.SetStateAction<Captain[]>>;
  handleAddVolunteer: (volunteerData: Omit<Volunteer, 'id'>) => void;
  handleDeleteVolunteer: (id: string) => void;
  handleAddShift: (shiftData: Omit<Shift, 'id'>) => void;
  handleDeleteShift: (id: string) => void;
  handleAddMultipleShifts: (shiftsToAdd: Shift[]) => void;
} 