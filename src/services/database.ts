import { supabase } from '../lib/supabase'
import type { Volunteer, Shift, Captain } from '../types'

// ===============================
// SERVIÇOS DE VOLUNTÁRIOS
// ===============================

export const volunteerService = {
  // Buscar todos os voluntários
  async getAll(): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Erro ao buscar voluntários:', error)
      throw new Error('Erro ao carregar voluntários')
    }
    
    return data.map(volunteer => ({
      id: volunteer.id,
      name: volunteer.name,
      phone: volunteer.phone,
      congregation: volunteer.congregation,
      city: volunteer.city,
      isTeamLeader: volunteer.is_team_leader,
      imageUrl: volunteer.image_url,
      unavailableShifts: volunteer.unavailable_shifts || []
    }))
  },

  // Criar novo voluntário
  async create(volunteer: Omit<Volunteer, 'id'>): Promise<Volunteer> {
    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        name: volunteer.name,
        phone: volunteer.phone,
        congregation: volunteer.congregation,
        city: volunteer.city,
        is_team_leader: volunteer.isTeamLeader || false,
        image_url: volunteer.imageUrl,
        unavailable_shifts: volunteer.unavailableShifts || []
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar voluntário:', error)
      throw new Error('Erro ao criar voluntário')
    }
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      congregation: data.congregation,
      city: data.city,
      isTeamLeader: data.is_team_leader,
      imageUrl: data.image_url,
      unavailableShifts: data.unavailable_shifts || []
    }
  },

  // Atualizar voluntário
  async update(volunteer: Volunteer): Promise<Volunteer> {
    const { data, error } = await supabase
      .from('volunteers')
      .update({
        name: volunteer.name,
        phone: volunteer.phone,
        congregation: volunteer.congregation,
        city: volunteer.city,
        is_team_leader: volunteer.isTeamLeader,
        image_url: volunteer.imageUrl,
        unavailable_shifts: volunteer.unavailableShifts || []
      })
      .eq('id', volunteer.id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar voluntário:', error)
      throw new Error('Erro ao atualizar voluntário')
    }
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      congregation: data.congregation,
      city: data.city,
      isTeamLeader: data.is_team_leader,
      imageUrl: data.image_url,
      unavailableShifts: data.unavailable_shifts || []
    }
  },

  // Deletar voluntário
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar voluntário:', error)
      throw new Error('Erro ao deletar voluntário')
    }
  }
}

// ===============================
// SERVIÇOS DE TURNOS
// ===============================

export const shiftService = {
  // Buscar todos os turnos
  async getAll(): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar turnos:', error)
      throw new Error('Erro ao carregar turnos')
    }
    
    return data.map(shift => ({
      id: shift.id,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      location: shift.location,
      requiredVolunteers: shift.required_volunteers,
      periodName: shift.period_name
    }))
  },

  // Criar novo turno
  async create(shift: Omit<Shift, 'id'>): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        date: shift.date,
        start_time: shift.startTime,
        end_time: shift.endTime,
        location: shift.location,
        required_volunteers: shift.requiredVolunteers,
        period_name: shift.periodName
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar turno:', error)
      throw new Error('Erro ao criar turno')
    }
    
    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      requiredVolunteers: data.required_volunteers,
      periodName: data.period_name
    }
  },

  // Deletar turno
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar turno:', error)
      throw new Error('Erro ao deletar turno')
    }
  }
}

// ===============================
// SERVIÇOS DE ALOCAÇÕES
// ===============================

export const allocationService = {
  // Buscar todas as alocações
  async getAll(): Promise<Record<string, string[]>> {
    const { data, error } = await supabase
      .from('allocations')
      .select('shift_id, volunteer_id')
    
    if (error) {
      console.error('Erro ao buscar alocações:', error)
      throw new Error('Erro ao carregar alocações')
    }
    
    // Converter para o formato usado pela aplicação
    const allocations: Record<string, string[]> = {}
    data.forEach(allocation => {
      if (!allocations[allocation.shift_id]) {
        allocations[allocation.shift_id] = []
      }
      allocations[allocation.shift_id].push(allocation.volunteer_id)
    })
    
    return allocations
  },

  // Adicionar alocação
  async add(shiftId: string, volunteerId: string): Promise<void> {
    // Verificar se a alocação já existe antes de inserir
    const { data: existing } = await supabase
      .from('allocations')
      .select('id')
      .eq('shift_id', shiftId)
      .eq('volunteer_id', volunteerId)
      .single()
    
    if (existing) {
      console.log('Alocação já existe, pulando inserção')
      return
    }
    
    const { error } = await supabase
      .from('allocations')
      .insert({
        shift_id: shiftId,
        volunteer_id: volunteerId
      })
    
    if (error) {
      console.error('Erro ao criar alocação:', error)
      throw new Error('Erro ao alocar voluntário')
    }
  },

  // Remover alocação
  async remove(shiftId: string, volunteerId: string): Promise<void> {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('shift_id', shiftId)
      .eq('volunteer_id', volunteerId)
    
    if (error) {
      console.error('Erro ao remover alocação:', error)
      throw new Error('Erro ao remover alocação')
    }
  },

  // Substituir todas as alocações (para importação de backup)
  async replaceAll(allocations: Record<string, string[]>): Promise<void> {
    try {
      // Primeiro, deletar todas as alocações existentes
      const { error: deleteError } = await supabase
        .from('allocations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos
      
      if (deleteError) {
        console.warn('Aviso ao limpar alocações:', deleteError)
        // Não parar aqui, continuar com a inserção
      }
      
      // Preparar dados para inserção com validação
      const insertData = []
      for (const [shiftId, volunteerIds] of Object.entries(allocations)) {
        if (Array.isArray(volunteerIds)) {
          for (const volunteerId of volunteerIds) {
            if (volunteerId && typeof volunteerId === 'string' && shiftId) {
              insertData.push({
                shift_id: shiftId,
                volunteer_id: volunteerId
              })
            }
          }
        }
      }
      
      if (insertData.length > 0) {
        // Inserir em lotes menores para melhor performance
        const batchSize = 50;
        for (let i = 0; i < insertData.length; i += batchSize) {
          const batch = insertData.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('allocations')
            .insert(batch)
          
          if (insertError) {
            console.warn(`Aviso no lote ${Math.floor(i / batchSize) + 1}:`, insertError)
            // Continuar com próximo lote em vez de parar
          }
        }
        console.log(`✅ ${insertData.length} alocações processadas com sucesso`)
      }
    } catch (error) {
      console.error('Erro na substituição de alocações:', error)
      // Não lançar erro para não quebrar o fluxo
      console.log('⚠️ Continuando sem as alocações devido a erro')
    }
  }
}

// ===============================
// SERVIÇOS DE CAPITÃES
// ===============================

export const captainService = {
  // Buscar todos os capitães
  async getAll(): Promise<Captain[]> {
    const { data, error } = await supabase
      .from('captains')
      .select('*')
      .order('date')
    
    if (error) {
      console.error('Erro ao buscar capitães:', error)
      throw new Error('Erro ao carregar capitães')
    }
    
    return data.map(captain => ({
      id: captain.id,
      date: captain.date,
      volunteerId: captain.volunteer_id,
      location: 'portaria' as const // Por enquanto, definindo como portaria por padrão
    }))
  },

  // Definir capitão para uma data
  async set(date: string, volunteerId: string, location: 'portaria' | 'patio' = 'portaria'): Promise<Captain> {
    // Primeiro, verificar se já existe um capitão para esta data
    const { data: existing } = await supabase
      .from('captains')
      .select('id')
      .eq('date', date)
      .single()
    
    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('captains')
        .update({ volunteer_id: volunteerId })
        .eq('date', date)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar capitão:', error)
        throw new Error('Erro ao atualizar capitão')
      }
      
      return {
        id: data.id,
        date: data.date,
        volunteerId: data.volunteer_id,
        location: location
      }
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from('captains')
        .insert({
          date: date,
          volunteer_id: volunteerId
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao criar capitão:', error)
        throw new Error('Erro ao definir capitão')
      }
      
      return {
        id: data.id,
        date: data.date,
        volunteerId: data.volunteer_id,
        location: location
      }
    }
  },

  // Remover capitão de uma data
  async remove(date: string): Promise<void> {
    const { error } = await supabase
      .from('captains')
      .delete()
      .eq('date', date)
    
    if (error) {
      console.error('Erro ao remover capitão:', error)
      throw new Error('Erro ao remover capitão')
    }
  }
} 