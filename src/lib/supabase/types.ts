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
      cadernos: {
        Row: {
          capa_url: string | null;
          criado_em: string;
          descricao: string | null;
          disponivel_no_white: boolean;
          id: string;
          numero_paginas: number | null;
          ordem: number;
          pdf_url: string | null;
          sistema_id: string | null;
          titulo: string;
        };
        Insert: {
          capa_url?: string | null;
          criado_em?: string;
          descricao?: string | null;
          disponivel_no_white?: boolean;
          id?: string;
          numero_paginas?: number | null;
          ordem?: number;
          pdf_url?: string | null;
          sistema_id?: string | null;
          titulo: string;
        };
        Update: {
          capa_url?: string | null;
          criado_em?: string;
          descricao?: string | null;
          disponivel_no_white?: boolean;
          id?: string;
          numero_paginas?: number | null;
          ordem?: number;
          pdf_url?: string | null;
          sistema_id?: string | null;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cadernos_sistema_id_fkey";
            columns: ["sistema_id"];
            isOneToOne: false;
            referencedRelation: "sistemas";
            referencedColumns: ["id"];
          },
        ];
      };
      estrategia_estudo: {
        Row: {
          atualizado_em: string;
          formatos_json: Json;
          id: string;
          metas_json: Json;
          user_id: string;
        };
        Insert: {
          atualizado_em?: string;
          formatos_json?: Json;
          id?: string;
          metas_json?: Json;
          user_id: string;
        };
        Update: {
          atualizado_em?: string;
          formatos_json?: Json;
          id?: string;
          metas_json?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      flashcard_progresso: {
        Row: {
          anotacao: string | null;
          atualizado_em: string;
          caixa: number;
          flashcard_id: string;
          id: string;
          proxima_revisao: string;
          user_id: string;
        };
        Insert: {
          anotacao?: string | null;
          atualizado_em?: string;
          caixa?: number;
          flashcard_id: string;
          id?: string;
          proxima_revisao?: string;
          user_id: string;
        };
        Update: {
          anotacao?: string | null;
          atualizado_em?: string;
          caixa?: number;
          flashcard_id?: string;
          id?: string;
          proxima_revisao?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_progresso_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcard_sessao_reflexoes: {
        Row: {
          acertos: number;
          criado_em: string;
          duracao_segundos: number | null;
          erros: number;
          id: string;
          total_cartoes: number;
          user_id: string;
          texto: string;
          xp_ganho: number;
        };
        Insert: {
          acertos: number;
          criado_em?: string;
          duracao_segundos?: number | null;
          erros: number;
          id?: string;
          total_cartoes: number;
          user_id: string;
          texto: string;
          xp_ganho: number;
        };
        Update: {
          acertos?: number;
          criado_em?: string;
          duracao_segundos?: number | null;
          erros?: number;
          id?: string;
          total_cartoes?: number;
          user_id?: string;
          texto?: string;
          xp_ganho?: number;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          alternativas: Json | null;
          criado_em: string;
          explicacao: string | null;
          frente: string;
          id: string;
          imagem_url: string | null;
          marcador_numero: number | null;
          marcador_x: number | null;
          marcador_y: number | null;
          prancha_id: string;
          resposta_correta: string | null;
          tipo: Database["public"]["Enums"]["tipo_flashcard"];
          verso: string;
        };
        Insert: {
          alternativas?: Json | null;
          criado_em?: string;
          explicacao?: string | null;
          frente: string;
          id?: string;
          imagem_url?: string | null;
          marcador_numero?: number | null;
          marcador_x?: number | null;
          marcador_y?: number | null;
          prancha_id: string;
          resposta_correta?: string | null;
          tipo?: Database["public"]["Enums"]["tipo_flashcard"];
          verso: string;
        };
        Update: {
          alternativas?: Json | null;
          criado_em?: string;
          explicacao?: string | null;
          frente?: string;
          id?: string;
          imagem_url?: string | null;
          marcador_numero?: number | null;
          marcador_x?: number | null;
          marcador_y?: number | null;
          prancha_id?: string;
          resposta_correta?: string | null;
          tipo?: Database["public"]["Enums"]["tipo_flashcard"];
          verso?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_prancha_id_fkey";
            columns: ["prancha_id"];
            isOneToOne: false;
            referencedRelation: "pranchas";
            referencedColumns: ["id"];
          },
        ];
      };
      habitos_dia: {
        Row: {
          cumprido: boolean;
          data: string;
          formatos_usados_json: Json;
          id: string;
          minutos_estudados: number;
          user_id: string;
        };
        Insert: {
          cumprido?: boolean;
          data?: string;
          formatos_usados_json?: Json;
          id?: string;
          minutos_estudados?: number;
          user_id: string;
        };
        Update: {
          cumprido?: boolean;
          data?: string;
          formatos_usados_json?: Json;
          id?: string;
          minutos_estudados?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      prancha_imagens: {
        Row: {
          criado_em: string;
          id: string;
          imagem_url: string;
          ordem: number;
          prancha_id: string;
          titulo: string;
        };
        Insert: {
          criado_em?: string;
          id?: string;
          imagem_url: string;
          ordem?: number;
          prancha_id: string;
          titulo: string;
        };
        Update: {
          criado_em?: string;
          id?: string;
          imagem_url?: string;
          ordem?: number;
          prancha_id?: string;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prancha_imagens_prancha_id_fkey";
            columns: ["prancha_id"];
            isOneToOne: false;
            referencedRelation: "pranchas";
            referencedColumns: ["id"];
          },
        ];
      };
      pranchas: {
        Row: {
          conteudo_teorico: Json;
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
          conteudo_teorico?: Json;
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
          conteudo_teorico?: Json;
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
          id: string;
          prancha_id: string;
          user_id: string;
        };
        Insert: {
          anotacoes?: string | null;
          atualizado_em?: string;
          completo?: boolean;
          id?: string;
          prancha_id: string;
          user_id: string;
        };
        Update: {
          anotacoes?: string | null;
          atualizado_em?: string;
          completo?: boolean;
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
          dificuldade: Database["public"]["Enums"]["dificuldade_quiz"];
          explicacao: string | null;
          id: string;
          pergunta: string;
          prancha_id: string;
          resposta_correta: string;
          tipo: Database["public"]["Enums"]["tipo_quiz"];
        };
        Insert: {
          alternativas: Json;
          criado_em?: string;
          dificuldade?: Database["public"]["Enums"]["dificuldade_quiz"];
          explicacao?: string | null;
          id?: string;
          pergunta: string;
          prancha_id: string;
          resposta_correta: string;
          tipo?: Database["public"]["Enums"]["tipo_quiz"];
        };
        Update: {
          alternativas?: Json;
          criado_em?: string;
          dificuldade?: Database["public"]["Enums"]["dificuldade_quiz"];
          explicacao?: string | null;
          id?: string;
          pergunta?: string;
          prancha_id?: string;
          resposta_correta?: string;
          tipo?: Database["public"]["Enums"]["tipo_quiz"];
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
          peso_repeticao: number;
          pergunta_id: string;
          respondido_em: string;
          user_id: string;
        };
        Insert: {
          acertou: boolean;
          id?: string;
          peso_repeticao?: number;
          pergunta_id: string;
          respondido_em?: string;
          user_id: string;
        };
        Update: {
          acertou?: boolean;
          id?: string;
          peso_repeticao?: number;
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
      sessoes_estudo: {
        Row: {
          criado_em: string;
          id: string;
          minutos: number;
          tipo: Database["public"]["Enums"]["formato_estudo"];
          user_id: string;
        };
        Insert: {
          criado_em?: string;
          id?: string;
          minutos: number;
          tipo: Database["public"]["Enums"]["formato_estudo"];
          user_id: string;
        };
        Update: {
          criado_em?: string;
          id?: string;
          minutos?: number;
          tipo?: Database["public"]["Enums"]["formato_estudo"];
          user_id?: string;
        };
        Relationships: [];
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
      cadernos_catalogo: {
        Args: Record<PropertyKey, never>;
        Returns: {
          capa_url: string | null;
          criado_em: string;
          descricao: string | null;
          disponivel_no_white: boolean;
          id: string;
          numero_paginas: number | null;
          ordem: number;
          sistema_id: string | null;
          titulo: string;
        }[];
      };
      ranking: {
        Args: {
          filtro_sistema_slug?: string;
        };
        Returns: {
          nome: string;
          pontos_totais: number;
          posicao: number;
          user_id: string;
        }[];
      };
    };
    Enums: {
      dificuldade_quiz: "facil" | "medio" | "dificil";
      formato_estudo: "colorir" | "quiz" | "flashcards" | "leitura" | "pomodoro";
      plano_usuario: "white" | "black";
      tipo_flashcard: "visual" | "conceitual";
      tipo_quiz: "multipla_escolha" | "apontar_imagem";
      tipo_sessao_pomodoro: "foco" | "descanso";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
