export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            agenda: {
                Row: {
                    created_at: string | null
                    date: string | null
                    id: string
                    location: string | null
                    period: string | null
                    time: string
                    title: string
                    type: string | null
                }
                Insert: {
                    created_at?: string | null
                    date?: string | null
                    id?: string
                    location?: string | null
                    period?: string | null
                    time: string
                    title: string
                    type?: string | null
                }
                Update: {
                    created_at?: string | null
                    date?: string | null
                    id?: string
                    location?: string | null
                    period?: string | null
                    time?: string
                    title?: string
                    type?: string | null
                }
                Relationships: []
            }
            registros_aula: {
                Row: {
                    conteudo: string | null
                    created_at: string | null
                    data: string | null
                    exercicios: string | null
                    horario: string | null
                    id: string
                    proximos_passos: string | null
                    turma_id: string | null
                }
                Insert: {
                    conteudo?: string | null
                    created_at?: string | null
                    data?: string | null
                    exercicios?: string | null
                    horario?: string | null
                    id?: string
                    proximos_passos?: string | null
                    turma_id?: string | null
                }
                Update: {
                    conteudo?: string | null
                    created_at?: string | null
                    data?: string | null
                    exercicios?: string | null
                    horario?: string | null
                    id?: string
                    proximos_passos?: string | null
                    turma_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "registros_aula_turma_id_fkey"
                        columns: ["turma_id"]
                        isOneToOne: false
                        referencedRelation: "turmas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            turmas: {
                Row: {
                    created_at: string | null
                    id: string
                    image_url: string | null
                    name: string
                    next_class: string | null
                    status: string | null
                    students_count: number | null
                    subject: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                    next_class?: string | null
                    status?: string | null
                    students_count?: number | null
                    subject: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                    next_class?: string | null
                    status?: string | null
                    students_count?: number | null
                    subject?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
