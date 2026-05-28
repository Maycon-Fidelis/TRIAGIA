export type UrgencyLevel = "CRITICO" | "PRIORITARIO" | "ELETIVO";
export type ExamStatus = "AGUARDANDO" | "PROCESSANDO" | "ANALISADO" | "LAUDADO" | "ERRO";

export interface Patient {
  id: string;
  nome: string;
  cpf?: string;
  data_nascimento?: string;
  sexo?: "M" | "F";
  telefone?: string;
  municipio?: string;
  created_at: string;
}

export interface Finding {
  descricao: string;
  regiao: string;
  confianca: number;
  severidade: "alta" | "media" | "baixa";
}

export interface AIResult {
  id: string;
  exam_id: string;
  modelo_ia: string;
  versao_modelo?: string;
  urgencia_sugerida: UrgencyLevel;
  confianca: number;
  achados: Finding[];
  score_bruto?: number;
  tempo_processamento_ms?: number;
  imagem_processada_url?: string;
  metadata_dicom?: Record<string, string>;
  created_at: string;
}

export interface Exam {
  id: string;
  patient_id: string;
  patient?: Patient;
  tipo_exame: string;
  modalidade?: string;
  arquivo_url?: string;
  status: ExamStatus;
  urgencia: UrgencyLevel;
  data_realizacao: string;
  data_analise_ia?: string;
  solicitante?: string;
  observacoes?: string;
  municipio_origem?: string;
  ai_results: AIResult[];
  reports: Report[];
  created_at: string;
}

export interface ExamQueueItem {
  id: string;
  paciente_nome: string;
  paciente_municipio?: string;
  tipo_exame: string;
  status: ExamStatus;
  urgencia: UrgencyLevel;
  data_realizacao: string;
  arquivo_url?: string;
  ia_confianca?: number;
  ia_urgencia?: UrgencyLevel;
  ia_achados?: Finding[];
}

export interface Report {
  id: string;
  exam_id: string;
  radiologist_name: string;
  crm?: string;
  laudo: string;
  urgencia_final: UrgencyLevel;
  confirma_ia?: boolean;
  data_laudo: string;
  created_at: string;
}

export interface DashboardStats {
  total_exames: number;
  fila: { criticos: number; prioritarios: number; eletivos: number };
  status: { aguardando: number; processando: number; laudados: number };
  ia: { taxa_concordancia_pct?: number; tempo_medio_analise_ms?: number };
}

export const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { label: string; color: string; bg: string; border: string; dot: string; pulse: boolean }
> = {
  CRITICO: {
    label: "Crítico",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-500",
    pulse: true,
  },
  PRIORITARIO: {
    label: "Prioritário",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    dot: "bg-amber-500",
    pulse: false,
  },
  ELETIVO: {
    label: "Eletivo",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
    dot: "bg-green-500",
    pulse: false,
  },
};

export const STATUS_CONFIG: Record<ExamStatus, { label: string; color: string }> = {
  AGUARDANDO: { label: "Aguardando", color: "text-gray-500" },
  PROCESSANDO: { label: "Analisando IA…", color: "text-blue-600" },
  ANALISADO: { label: "Analisado", color: "text-indigo-600" },
  LAUDADO: { label: "Laudado", color: "text-green-600" },
  ERRO: { label: "Erro", color: "text-red-600" },
};

export const EXAM_TYPE_LABELS: Record<string, string> = {
  RX_TORAX: "RX Tórax",
  RX_COLUNA: "RX Coluna",
  RX_MEMBROS: "RX Membros",
  RX_ABDOME: "RX Abdome",
  RX_CRANIO: "RX Crânio",
  TC_CRANIO: "TC Crânio",
  TC_TORAX: "TC Tórax",
  TC_ABDOME: "TC Abdome",
  TC_COLUNA: "TC Coluna",
  RM_CRANIO: "RM Crânio",
  RM_COLUNA: "RM Coluna",
  RM_JOELHO: "RM Joelho",
  OUTRO: "Outro",
};
