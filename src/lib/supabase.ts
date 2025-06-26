import { createClient } from '@supabase/supabase-js'

// INSTRUÇÕES PARA CONFIGURAR O SUPABASE:
// 1. Acesse https://supabase.com e crie uma conta
// 2. Crie um novo projeto
// 3. Vá em Settings > API
// 4. Substitua as URLs e chaves abaixo pelas suas credenciais

// Configuração do Supabase
const supabaseUrl = 'https://xwgdcsqjyibrreppyrdv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z2Rjc3FqeWlicnJlcHB5cmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTAyMDgsImV4cCI6MjA2NjQ4NjIwOH0.iqfUTrKNp2Nq9ic0dM9cc7pQQfSxRJ-7gZzGnENnrcY'

// Verificar se as credenciais estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  throw new Error('Credenciais do Supabase não configuradas')
}

// Criar cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Desabilitar persistência de sessão por enquanto
  },
  db: {
    schema: 'public', // Usar schema público
  },
  global: {
    headers: {
      'X-Client-Info': 'parkflow-app',
    },
  },
})

// Teste de conexão na inicialização (executado automaticamente)
setTimeout(() => {
  supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .then(({ error, count }) => {
      if (error) {
        console.error('❌ Erro na conexão inicial com Supabase:', error.message)
      } else {
        console.log('✅ Conexão com Supabase estabelecida com sucesso! Voluntários:', count)
      }
    })
}, 1000)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      volunteers: {
        Row: {
          id: string
          name: string
          phone: string
          congregation: string
          city: string
          is_team_leader: boolean
          image_url?: string
          unavailable_shifts: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          congregation: string
          city: string
          is_team_leader?: boolean
          image_url?: string
          unavailable_shifts?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          congregation?: string
          city?: string
          is_team_leader?: boolean
          image_url?: string
          unavailable_shifts?: string[]
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          location: string
          required_volunteers: number
          period_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          location: string
          required_volunteers: number
          period_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          location?: string
          required_volunteers?: number
          period_name?: string
          updated_at?: string
        }
      }
      allocations: {
        Row: {
          id: string
          shift_id: string
          volunteer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          volunteer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          volunteer_id?: string
        }
      }
      captains: {
        Row: {
          id: string
          date: string
          volunteer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          volunteer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          volunteer_id?: string
          updated_at?: string
        }
      }
    }
  }
} 