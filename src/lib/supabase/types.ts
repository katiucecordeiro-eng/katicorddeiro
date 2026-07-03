// Gerado a partir do schema do Supabase (projeto Asterik).
// Para regenerar após alterar o schema: supabase gen types typescript.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      pranchas: {
        Row: {
          criado_em: string;
          disponivel_no_white: boolean;
          id: string;
          imagem_base_url: string | null;
          imagem_pdf_url: string | null;
          imagem_referencia_url: string | null;
          legenda_cores: Json;
          numero_prancha: string;
          sistema_id: string;
          titulo: string;
        };
        Insert: {
          criado_em?: string;
          disponivel_no_white?: boolean;
          id?: string;
          imagem_base_url?: string | null;
          imagem_pdf_url?: string | null;
          imagem_referencia_url?: string | null;
          legenda_cores?: Json;
          numero_prancha: string;
          sistema_id: string;
          titulo: string;
        };
        Update: {
          criado_em?: string;
          disponivel_no_white?: boolean;
          id?: string;
          imagem_base_url?: string | null;
          imagem_pdf_url?: string | null;
          imagem_referencia_url?: string | null;
          legenda_cores?: Json;
          numero_prancha?: string;
          sistema_id?: string;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pranchas_sistema_id_fkey";
            columns: ["sistema_id"];
            isOneToOne: false;
            referencedRelation: "sistemas";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          criado_em: string;
          email: string;
          id: string;
          nome: string;
          plano: Database["public"]["Enums"]["plano_usuario"];
          xp_total: number;
        };
        Insert: {
          criado_em?: string;
          email: string;
          id: string;
          nome?: string;
          plano?: Database["public"]["Enums"]["plano_usuario"];
          xp_total?: number;
        };
        Update: {
          criado_em?: string;
          email?: string;
          id?: string;
          nome?: string;
          plano?: Database["public"]["Enums"]["plano_usuario"];
          xp_total?: number;
        };
        Relationships: [];
      };
      progresso_usuario: {
        Row: {
          anotacoes: string | null;
          atualizado_em: string;
          completo: boolean;
          cores_preenchidas: Json;
          id: string;
          prancha_id: string;
          user_id: string;
        };
        Insert: {
          anotacoes?: string | null;
          atualizado_em?: string;
          completo?: boolean;
          cores_preenchidas?: Json;
          id?: string;
          prancha_id: string;
          user_id: string;
        };
        Update: {
          anotacoes?: string | null;
          atualizado_em?: string;
          completo?: boolean;
          cores_preenchidas?: Json;
          id?: string;
          prancha_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "progresso_usuario_prancha_id_fkey";
            columns: ["prancha_id"];
            isOneToOne: false;
            referencedRelation: "pranchas";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_perguntas: {
        Row: {
          alternativas: Json;
          criado_em: string;
          id: string;
          pergunta: string;
          prancha_id: string;
          resposta_correta: string;
        };
        Insert: {
          alternativas: Json;
          criado_em?: string;
          id?: string;
          pergunta: string;
          prancha_id: string;
          resposta_correta: string;
        };
        Update: {
          alternativas?: Json;
          criado_em?: string;
          id?: string;
          pergunta?: string;
          prancha_id?: string;
          resposta_correta?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_perguntas_prancha_id_fkey";
            columns: ["prancha_id"];
            isOneToOne: false;
            referencedRelation: "pranchas";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_respostas_usuario: {
        Row: {
          acertou: boolean;
          id: string;
          pergunta_id: string;
          respondido_em: string;
          user_id: string;
        };
        Insert: {
          acertou: boolean;
          id?: string;
          pergunta_id: string;
          respondido_em?: string;
          user_id: string;
        };
        Update: {
          acertou?: boolean;
          id?: string;
          pergunta_id?: string;
          respondido_em?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_respostas_usuario_pergunta_id_fkey";
            columns: ["pergunta_id"];
            isOneToOne: false;
            referencedRelation: "quiz_perguntas";
            referencedColumns: ["id"];
          },
        ];
      };
      sessoes_pomodoro: {
        Row: {
          duracao_minutos: number;
          finalizado_em: string | null;
          id: string;
          iniciado_em: string;
          tipo: Database["public"]["Enums"]["tipo_sessao_pomodoro"];
          user_id: string;
        };
        Insert: {
          duracao_minutos: number;
          finalizado_em?: string | null;
          id?: string;
          iniciado_em?: string;
          tipo?: Database["public"]["Enums"]["tipo_sessao_pomodoro"];
          user_id: string;
        };
        Update: {
          duracao_minutos?: number;
          finalizado_em?: string | null;
          id?: string;
          iniciado_em?: string;
          tipo?: Database["public"]["Enums"]["tipo_sessao_pomodoro"];
          user_id?: string;
        };
        Relationships: [];
      };
      sistemas: {
        Row: {
          conteudo_teorico: Json;
          criado_em: string;
          id: string;
          nome: string;
          ordem: number;
          slug: string;
          thumbnail_url: string | null;
        };
        Insert: {
          conteudo_teorico?: Json;
          criado_em?: string;
          id?: string;
          nome: string;
          ordem?: number;
          slug: string;
          thumbnail_url?: string | null;
        };
        Update: {
          conteudo_teorico?: Json;
          criado_em?: string;
          id?: string;
          nome?: string;
          ordem?: number;
          slug?: string;
          thumbnail_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      ranking: {
        Args: Record<PropertyKey, never>;
        Returns: {
          nome: string;
          pontos_totais: number;
          posicao: number;
          user_id: string;
        }[];
      };
    };
    Enums: {
      plano_usuario: "white" | "black";
      tipo_sessao_pomodoro: "foco" | "descanso";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
