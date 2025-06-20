import { useOutletContext } from "react-router-dom";
import { VolunteerForm } from "../components/VolunteerForm";
import { VolunteerList } from "../components/VolunteerList";
import type { Volunteer } from "../types";

type VolunteersContext = {
  volunteers: Volunteer[];
  handleAddVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
  handleDeleteVolunteer: (id: string) => void;
}

export function Volunteers() {
  const { volunteers, handleAddVolunteer, handleDeleteVolunteer } = useOutletContext<VolunteersContext>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Voluntários</h1>
      <VolunteerForm onAddVolunteer={handleAddVolunteer} existingVolunteers={volunteers} />
      <VolunteerList volunteers={volunteers} onDeleteVolunteer={handleDeleteVolunteer} />
    </div>
  );
} 