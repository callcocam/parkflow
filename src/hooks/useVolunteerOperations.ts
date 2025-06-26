import { useCallback } from 'react';
import { volunteerService } from '../services/database';
import type { Volunteer } from '../types';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';

// Hook para operações de voluntários com sincronização híbrida
export function useVolunteerOperations(
  volunteers: Volunteer[],
  setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>,
  saveToLocalStorage: (key: string, data: any) => void
) {
  
  // Adicionar voluntário
  const handleAddVolunteer = useCallback(async (volunteerData: Omit<Volunteer, 'id'>) => {
    const newVolunteer: Volunteer = {
      id: nanoid(),
      ...volunteerData,
    };

    try {
      // 1. Primeiro salvar no Supabase
      const savedVolunteer = await volunteerService.create(volunteerData);
      
      // 2. Atualizar estado local com dados do Supabase (garantir consistência)
      const updatedVolunteers = [...volunteers, savedVolunteer];
      setVolunteers(updatedVolunteers);
      
      // 3. Backup no localStorage
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.success(`Voluntário ${savedVolunteer.name} adicionado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao adicionar voluntário:', error);
      
      // Fallback: salvar apenas localmente
      const updatedVolunteers = [...volunteers, newVolunteer];
      setVolunteers(updatedVolunteers);
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.error('Erro ao salvar no banco. Salvo localmente.');
    }
  }, [volunteers, setVolunteers, saveToLocalStorage]);

  // Editar voluntário
  const handleEditVolunteer = useCallback(async (updatedVolunteer: Volunteer) => {
    try {
      // 1. Primeiro atualizar no Supabase
      const savedVolunteer = await volunteerService.update(updatedVolunteer);
      
      // 2. Atualizar estado local com dados do Supabase
      const updatedVolunteers = volunteers.map((volunteer) =>
        volunteer.id === savedVolunteer.id ? savedVolunteer : volunteer
      );
      setVolunteers(updatedVolunteers);
      
      // 3. Backup no localStorage
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.success(`Voluntário ${savedVolunteer.name} atualizado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao atualizar voluntário:', error);
      
      // Fallback: atualizar apenas localmente
      const updatedVolunteers = volunteers.map((volunteer) =>
        volunteer.id === updatedVolunteer.id ? updatedVolunteer : volunteer
      );
      setVolunteers(updatedVolunteers);
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.error('Erro ao atualizar no banco. Salvo localmente.');
    }
  }, [volunteers, setVolunteers, saveToLocalStorage]);

  // Deletar voluntário
  const handleDeleteVolunteer = useCallback(async (id: string) => {
    const volunteerToDelete = volunteers.find(v => v.id === id);
    
    try {
      // 1. Primeiro deletar do Supabase
      await volunteerService.delete(id);
      
      // 2. Atualizar estado local
      const updatedVolunteers = volunteers.filter((v) => v.id !== id);
      setVolunteers(updatedVolunteers);
      
      // 3. Backup no localStorage
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.success(`Voluntário ${volunteerToDelete?.name || 'desconhecido'} removido com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao deletar voluntário:', error);
      
      // Fallback: deletar apenas localmente
      const updatedVolunteers = volunteers.filter((v) => v.id !== id);
      setVolunteers(updatedVolunteers);
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.error('Erro ao deletar do banco. Removido localmente.');
    }
  }, [volunteers, setVolunteers, saveToLocalStorage]);

  // Toggle líder
  const handleToggleLeader = useCallback(async (id: string) => {
    const volunteerToToggle = volunteers.find(v => v.id === id);
    if (!volunteerToToggle) return;

    const updatedVolunteer = {
      ...volunteerToToggle,
      isTeamLeader: !volunteerToToggle.isTeamLeader
    };

    try {
      // 1. Primeiro atualizar no Supabase
      const savedVolunteer = await volunteerService.update(updatedVolunteer);
      
      // 2. Atualizar estado local
      const updatedVolunteers = volunteers.map((volunteer) =>
        volunteer.id === id ? savedVolunteer : volunteer
      );
      setVolunteers(updatedVolunteers);
      
      // 3. Backup no localStorage
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      const status = savedVolunteer.isTeamLeader ? 'promovido a líder' : 'removido da liderança';
      toast.success(`${savedVolunteer.name} ${status}!`);
      
    } catch (error) {
      console.error('Erro ao alterar status de líder:', error);
      
      // Fallback: atualizar apenas localmente
      const updatedVolunteers = volunteers.map((volunteer) =>
        volunteer.id === id ? updatedVolunteer : volunteer
      );
      setVolunteers(updatedVolunteers);
      saveToLocalStorage('volunteers', updatedVolunteers);
      
      toast.error('Erro ao atualizar no banco. Salvo localmente.');
    }
  }, [volunteers, setVolunteers, saveToLocalStorage]);

  return {
    handleAddVolunteer,
    handleEditVolunteer,
    handleDeleteVolunteer,
    handleToggleLeader
  };
} 