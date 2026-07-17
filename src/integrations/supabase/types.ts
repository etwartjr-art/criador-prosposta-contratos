export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          cep: string
          cidade: string
          cnpj: string
          created_at: string
          email: string | null
          endereco: string
          id: string
          inscricao_estadual: string | null
          nome_fantasia: string | null
          razao_social: string
          regime_tributario: string | null
          telefone: string | null
          uf: string
        }
        Insert: {
          cep: string
          cidade: string
          cnpj: string
          created_at?: string
          email?: string | null
          endereco: string
          id: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social: string
          regime_tributario?: string | null
          telefone?: string | null
          uf: string
        }
        Update: {
          cep?: string
          cidade?: string
          cnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          regime_tributario?: string | null
          telefone?: string | null
          uf?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_id: string
          created_at: string
          fim_vigencia: string
          id: string
          inicio_vigencia: string
          numero: string
          observacoes: string | null
          proposal_id: string | null
          services: Json
          signatarios_cliente_ids: Json
          signatarios_contratada: Json
          status: string
          valor_mensal: number
        }
        Insert: {
          client_id: string
          created_at?: string
          fim_vigencia: string
          id: string
          inicio_vigencia: string
          numero: string
          observacoes?: string | null
          proposal_id?: string | null
          services?: Json
          signatarios_cliente_ids?: Json
          signatarios_contratada?: Json
          status?: string
          valor_mensal?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          fim_vigencia?: string
          id?: string
          inicio_vigencia?: string
          numero?: string
          observacoes?: string | null
          proposal_id?: string | null
          services?: Json
          signatarios_cliente_ids?: Json
          signatarios_contratada?: Json
          status?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      etw_settings: {
        Row: {
          cnpj: string
          email: string
          endereco: string
          foro: string
          id: number
          razao_social: string
          socios: Json
          updated_at: string
        }
        Insert: {
          cnpj: string
          email: string
          endereco: string
          foro: string
          id?: number
          razao_social: string
          socios?: Json
          updated_at?: string
        }
        Update: {
          cnpj?: string
          email?: string
          endereco?: string
          foro?: string
          id?: number
          razao_social?: string
          socios?: Json
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_id: string
          created_at: string
          data_emissao: string
          honorarios_mensais: number
          id: string
          items: Json
          numero: string
          observacoes: string | null
          status: string
          taxa_implantacao: number
          validade_dias: number
        }
        Insert: {
          client_id: string
          created_at?: string
          data_emissao: string
          honorarios_mensais?: number
          id: string
          items?: Json
          numero: string
          observacoes?: string | null
          status?: string
          taxa_implantacao?: number
          validade_dias?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          data_emissao?: string
          honorarios_mensais?: number
          id?: string
          items?: Json
          numero?: string
          observacoes?: string | null
          status?: string
          taxa_implantacao?: number
          validade_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      representatives: {
        Row: {
          cargo: string | null
          client_id: string
          cpf: string
          email: string | null
          id: string
          nome: string
          rg: string | null
          telefone: string | null
        }
        Insert: {
          cargo?: string | null
          client_id: string
          cpf: string
          email?: string | null
          id: string
          nome: string
          rg?: string | null
          telefone?: string | null
        }
        Update: {
          cargo?: string | null
          client_id?: string
          cpf?: string
          email?: string | null
          id?: string
          nome?: string
          rg?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "representatives_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          clausula_contratual: string
          descricao_escopo: string
          id: string
          modulo: string
          nome: string
        }
        Insert: {
          clausula_contratual: string
          descricao_escopo: string
          id: string
          modulo: string
          nome: string
        }
        Update: {
          clausula_contratual?: string
          descricao_escopo?: string
          id?: string
          modulo?: string
          nome?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
