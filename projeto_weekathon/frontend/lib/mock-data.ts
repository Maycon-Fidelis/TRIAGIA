import type { DashboardStats, ExamQueueItem, Exam, Patient } from "./types";

const now = new Date();
const ago = (h: number, m = 0) =>
  new Date(now.getTime() - h * 3600_000 - m * 60_000).toISOString();

// Imagem radiológica de demonstração (arquivo local em /public)
const XRAY_DEMO = "/xray-demo.png";

const XRAY_IMAGES: Record<string, string> = {
  RX_TORAX:  XRAY_DEMO,
  TC_TORAX:  XRAY_DEMO,
  TC_CRANIO: XRAY_DEMO,
  RX_CRANIO: XRAY_DEMO,
  RX_COLUNA: XRAY_DEMO,
  TC_COLUNA: XRAY_DEMO,
  RX_MEMBROS: XRAY_DEMO,
  RM_JOELHO:  XRAY_DEMO,
  RM_CRANIO:  XRAY_DEMO,
  TC_ABDOME:  XRAY_DEMO,
  RX_ABDOME:  XRAY_DEMO,
};

// ── Pacientes ────────────────────────────────────────────────────────────────
export const MOCK_PATIENTS: Patient[] = [
  { id: "p1", nome: "João da Silva Santos",       cpf: "12345678901", data_nascimento: "1965-03-15", sexo: "M", telefone: "(82) 99123-4567", municipio: "Maceió",                created_at: ago(48) },
  { id: "p2", nome: "Maria Aparecida Costa",      cpf: "98765432100", data_nascimento: "1980-07-22", sexo: "F", telefone: "(82) 99234-5678", municipio: "Arapiraca",             created_at: ago(48) },
  { id: "p3", nome: "Francisco Alves Lima",       cpf: "11122233344", data_nascimento: "1945-11-08", sexo: "M", telefone: "(82) 99345-6789", municipio: "Palmeira dos Índios",  created_at: ago(48) },
  { id: "p4", nome: "Ana Beatriz Ferreira",       cpf: "55566677788", data_nascimento: "1992-04-30", sexo: "F", telefone: "(82) 99456-7890", municipio: "União dos Palmares",   created_at: ago(48) },
  { id: "p5", nome: "Pedro Henrique Souza",       cpf: "99988877766", data_nascimento: "1955-09-12", sexo: "M", telefone: "(82) 99567-8901", municipio: "Penedo",               created_at: ago(72) },
  { id: "p6", nome: "Luciana Rodrigues Melo",     cpf: "33344455566", data_nascimento: "1978-01-19", sexo: "F", telefone: "(82) 99678-9012", municipio: "Santana do Ipanema",   created_at: ago(72) },
  { id: "p7", nome: "Carlos Eduardo Nunes",       cpf: "77788899900", data_nascimento: "1938-06-03", sexo: "M", telefone: "(82) 99789-0123", municipio: "São Miguel dos Campos", created_at: ago(72) },
  { id: "p8", nome: "Fernanda Lima Cavalcante",   cpf: "22233344455", data_nascimento: "2000-12-25", sexo: "F", telefone: "(82) 99890-1234", municipio: "Delmiro Gouveia",      created_at: ago(72) },
  { id: "p9", nome: "Roberto Gomes de Andrade",   cpf: "66677788899", data_nascimento: "1971-08-14", sexo: "M", telefone: "(82) 99901-2345", municipio: "Marechal Deodoro",     created_at: ago(96) },
  { id: "p10", nome: "Patrícia Vieira Nascimento", cpf: "44455566677", data_nascimento: "1988-03-07", sexo: "F", telefone: "(82) 99012-3456", municipio: "Coruripe",            created_at: ago(96) },
];

// ── Exames completos (usados em /exams e /exams/[id]) ────────────────────────
export const MOCK_EXAMS: Exam[] = [
  // ── CRÍTICOS
  {
    id: "e1", patient_id: "p1", patient: MOCK_PATIENTS[0],
    tipo_exame: "RX_TORAX", modalidade: "CR", arquivo_nome: "rx_torax_joao.dcm",
    arquivo_url: XRAY_IMAGES.RX_TORAX,
    status: "ANALISADO", urgencia: "CRITICO",
    data_realizacao: ago(2), data_analise_ia: ago(1, 50),
    solicitante: "Dr. Renato Borges", municipio_origem: "Maceió",
    observacoes: "Paciente com dispneia intensa e queda de saturação",
    ai_results: [{
      id: "ai1", exam_id: "e1", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "CRITICO", confianca: 0.92,
      achados: [
        { descricao: "Opacidade bilateral extensa compatível com edema pulmonar agudo", regiao: "ambos os pulmões", confianca: 0.91, severidade: "alta" },
        { descricao: "Derrame pleural maciço com atelectasia compressiva", regiao: "hemitórax esquerdo", confianca: 0.87, severidade: "alta" },
      ],
      score_bruto: 0.85, tempo_processamento_ms: 1230, created_at: ago(1, 50),
    }],
    reports: [], created_at: ago(2),
  },
  {
    id: "e2", patient_id: "p3", patient: MOCK_PATIENTS[2],
    tipo_exame: "TC_CRANIO", modalidade: "CT", arquivo_nome: "tc_cranio_francisco.dcm",
    arquivo_url: XRAY_IMAGES.TC_CRANIO,
    status: "ANALISADO", urgencia: "CRITICO",
    data_realizacao: ago(3), data_analise_ia: ago(2, 45),
    solicitante: "Dra. Silvia Martins", municipio_origem: "Palmeira dos Índios",
    observacoes: "TCE grave após acidente de moto, GCS 9",
    ai_results: [{
      id: "ai2", exam_id: "e2", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "CRITICO", confianca: 0.95,
      achados: [
        { descricao: "Hematoma subdural agudo com espessura > 10mm e desvio de linha média", regiao: "convexidade cerebral", confianca: 0.96, severidade: "alta" },
        { descricao: "Hemorragia subaracnóidea extensa com sangue nas cisternas basais", regiao: "espaço subaracnóide", confianca: 0.94, severidade: "alta" },
      ],
      score_bruto: 0.91, tempo_processamento_ms: 2450, created_at: ago(2, 45),
    }],
    reports: [], created_at: ago(3),
  },
  {
    id: "e3", patient_id: "p7", patient: MOCK_PATIENTS[6],
    tipo_exame: "TC_TORAX", modalidade: "CT", arquivo_nome: "tc_torax_carlos.dcm",
    arquivo_url: XRAY_IMAGES.TC_TORAX,
    status: "ANALISADO", urgencia: "CRITICO",
    data_realizacao: ago(1), data_analise_ia: ago(0, 45),
    solicitante: "Dr. Marcelo Farias", municipio_origem: "São Miguel dos Campos",
    observacoes: "Dor torácica súbita, suspeita de TEP",
    ai_results: [{
      id: "ai3", exam_id: "e3", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "CRITICO", confianca: 0.94,
      achados: [
        { descricao: "Tromboembolismo pulmonar bilateral com sinal de cor pulmonale agudo", regiao: "artérias pulmonares principais", confianca: 0.95, severidade: "alta" },
        { descricao: "Derrame pericárdico volumoso com sinais de tamponamento cardíaco", regiao: "saco pericárdico", confianca: 0.93, severidade: "alta" },
      ],
      score_bruto: 0.88, tempo_processamento_ms: 2100, created_at: ago(0, 45),
    }],
    reports: [], created_at: ago(1),
  },

  // ── PRIORITÁRIOS
  {
    id: "e4", patient_id: "p2", patient: MOCK_PATIENTS[1],
    tipo_exame: "RX_TORAX", modalidade: "CR", arquivo_nome: "rx_torax_maria.dcm",
    arquivo_url: XRAY_IMAGES.RX_TORAX,
    status: "ANALISADO", urgencia: "PRIORITARIO",
    data_realizacao: ago(5), data_analise_ia: ago(4, 50),
    solicitante: "Dr. André Costa", municipio_origem: "Arapiraca",
    observacoes: "Tosse produtiva há 3 semanas, febre vespertina",
    ai_results: [{
      id: "ai4", exam_id: "e4", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "PRIORITARIO", confianca: 0.82,
      achados: [
        { descricao: "Opacidade focal em lobo inferior direito compatível com pneumonia bacteriana", regiao: "lobo inferior direito", confianca: 0.82, severidade: "media" },
        { descricao: "Derrame pleural moderado à esquerda sem sinais de loculação", regiao: "hemitórax esquerdo", confianca: 0.78, severidade: "media" },
      ],
      score_bruto: 0.68, tempo_processamento_ms: 1180, created_at: ago(4, 50),
    }],
    reports: [], created_at: ago(5),
  },
  {
    id: "e5", patient_id: "p6", patient: MOCK_PATIENTS[5],
    tipo_exame: "RX_COLUNA", modalidade: "CR", arquivo_nome: "rx_coluna_luciana.dcm",
    arquivo_url: XRAY_IMAGES.RX_COLUNA,
    status: "ANALISADO", urgencia: "PRIORITARIO",
    data_realizacao: ago(6), data_analise_ia: ago(5, 30),
    solicitante: "Dra. Camila Rocha", municipio_origem: "Santana do Ipanema",
    observacoes: "Lombalgia aguda após queda de altura",
    ai_results: [{
      id: "ai5", exam_id: "e5", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "PRIORITARIO", confianca: 0.86,
      achados: [
        { descricao: "Fratura vertebral por compressão com acunhamento anterior > 30%", regiao: "corpo vertebral", confianca: 0.86, severidade: "media" },
      ],
      score_bruto: 0.65, tempo_processamento_ms: 980, created_at: ago(5, 30),
    }],
    reports: [], created_at: ago(6),
  },
  {
    id: "e6", patient_id: "p9", patient: MOCK_PATIENTS[8],
    tipo_exame: "TC_CRANIO", modalidade: "CT", arquivo_nome: "tc_cranio_roberto.dcm",
    arquivo_url: XRAY_IMAGES.TC_CRANIO,
    status: "ANALISADO", urgencia: "PRIORITARIO",
    data_realizacao: ago(4), data_analise_ia: ago(3, 40),
    solicitante: "Dr. Lucas Mendes", municipio_origem: "Marechal Deodoro",
    observacoes: "Cefaleia intensa de início súbito",
    ai_results: [{
      id: "ai6", exam_id: "e6", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "PRIORITARIO", confianca: 0.79,
      achados: [
        { descricao: "Lesão expansiva com captação de contraste sugestiva de processo neoplásico", regiao: "região parietal", confianca: 0.83, severidade: "media" },
        { descricao: "Hidrocefalia obstrutiva com aumento do sistema ventricular", regiao: "ventrículos laterais", confianca: 0.81, severidade: "media" },
      ],
      score_bruto: 0.59, tempo_processamento_ms: 2300, created_at: ago(3, 40),
    }],
    reports: [], created_at: ago(4),
  },

  // ── ELETIVOS
  {
    id: "e7", patient_id: "p4", patient: MOCK_PATIENTS[3],
    tipo_exame: "RX_MEMBROS", modalidade: "CR", arquivo_nome: "rx_membro_ana.dcm",
    arquivo_url: XRAY_IMAGES.RX_MEMBROS,
    status: "ANALISADO", urgencia: "ELETIVO",
    data_realizacao: ago(8), data_analise_ia: ago(7, 30),
    solicitante: "Dr. Paulo Ribeiro", municipio_origem: "União dos Palmares",
    observacoes: "Dor no joelho direito há 2 meses",
    ai_results: [{
      id: "ai7", exam_id: "e7", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "ELETIVO", confianca: 0.92,
      achados: [
        { descricao: "Exame sem evidência de lesões ósseas ou de partes moles", regiao: "geral", confianca: 0.93, severidade: "baixa" },
      ],
      score_bruto: 0.21, tempo_processamento_ms: 870, created_at: ago(7, 30),
    }],
    reports: [], created_at: ago(8),
  },
  {
    id: "e8", patient_id: "p8", patient: MOCK_PATIENTS[7],
    tipo_exame: "RX_TORAX", modalidade: "CR", arquivo_nome: "rx_torax_fernanda.dcm",
    arquivo_url: XRAY_IMAGES.RX_TORAX,
    status: "ANALISADO", urgencia: "ELETIVO",
    data_realizacao: ago(12), data_analise_ia: ago(11, 45),
    solicitante: "Dra. Juliana Azevedo", municipio_origem: "Delmiro Gouveia",
    observacoes: "Check-up pré-operatório",
    ai_results: [{
      id: "ai8", exam_id: "e8", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "ELETIVO", confianca: 0.90,
      achados: [
        { descricao: "Exame dentro dos limites da normalidade para a faixa etária", regiao: "geral", confianca: 0.92, severidade: "baixa" },
      ],
      score_bruto: 0.18, tempo_processamento_ms: 1050, created_at: ago(11, 45),
    }],
    reports: [], created_at: ago(12),
  },

  // ── LAUDADOS
  {
    id: "e9", patient_id: "p5", patient: MOCK_PATIENTS[4],
    tipo_exame: "RX_TORAX", modalidade: "CR", arquivo_nome: "rx_torax_pedro.dcm",
    arquivo_url: XRAY_IMAGES.RX_TORAX,
    status: "LAUDADO", urgencia: "PRIORITARIO",
    data_realizacao: ago(48), data_analise_ia: ago(47, 40),
    solicitante: "Dr. Renato Borges", municipio_origem: "Penedo",
    observacoes: "Controle pós pneumonia",
    ai_results: [{
      id: "ai9", exam_id: "e9", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "PRIORITARIO", confianca: 0.77,
      achados: [
        { descricao: "Cardiomegalia significativa (ICT > 0,55) com congestão pulmonar", regiao: "sombra cardíaca", confianca: 0.80, severidade: "media" },
        { descricao: "Acentuação da trama vascular broncovascular bilateral", regiao: "campos pulmonares", confianca: 0.80, severidade: "media" },
      ],
      score_bruto: 0.55, tempo_processamento_ms: 1140, created_at: ago(47, 40),
    }],
    reports: [{
      id: "r1", exam_id: "e9",
      radiologist_name: "Dr. Renato Borges", crm: "CRM-AL 12345",
      laudo: "Radiografia de tórax em PA e perfil. Observa-se cardiomegalia moderada com índice cardiotorácico de 0,57. Aumento da trama vascular pulmonar bilateral compatível com congestão venosa pulmonar leve a moderada. Seios costofrênicos livres. Não há consolidações parenquimatosas.\n\nImpressão: cardiomegalia com sinais de congestão pulmonar leve. Recomendo acompanhamento cardiológico.",
      urgencia_final: "PRIORITARIO", confirma_ia: true,
      data_laudo: ago(44), created_at: ago(44),
    }],
    created_at: ago(48),
  },
  {
    id: "e10", patient_id: "p10", patient: MOCK_PATIENTS[9],
    tipo_exame: "RM_JOELHO", modalidade: "MR", arquivo_nome: "rm_joelho_patricia.dcm",
    arquivo_url: XRAY_IMAGES.RM_JOELHO,
    status: "LAUDADO", urgencia: "ELETIVO",
    data_realizacao: ago(72), data_analise_ia: ago(71, 30),
    solicitante: "Dra. Camila Rocha", municipio_origem: "Coruripe",
    observacoes: "Dor crônica no joelho, suspeita de lesão meniscal",
    ai_results: [{
      id: "ai10", exam_id: "e10", modelo_ia: "RadIA-HeuristicV1", versao_modelo: "1.0.0",
      urgencia_sugerida: "ELETIVO", confianca: 0.88,
      achados: [
        { descricao: "Exame sem evidência de lesões ósseas ou de partes moles", regiao: "geral", confianca: 0.93, severidade: "baixa" },
      ],
      score_bruto: 0.23, tempo_processamento_ms: 3200, created_at: ago(71, 30),
    }],
    reports: [{
      id: "r2", exam_id: "e10",
      radiologist_name: "Dra. Camila Rocha", crm: "CRM-AL 54321",
      laudo: "Ressonância magnética do joelho direito sem contraste. Menisco medial com sinal heterogêneo em corno posterior sugestivo de degeneração grau II, sem extensão à superfície articular. Ligamento cruzado anterior íntegro. Cartilagem articular preservada. Pequeno derrame articular.\n\nImpressão: degeneração meniscal grau II sem lesão estrutural franca. Conduta conservadora.",
      urgencia_final: "ELETIVO", confirma_ia: true,
      data_laudo: ago(68), created_at: ago(68),
    }],
    created_at: ago(72),
  },

  // ── AGUARDANDO
  {
    id: "e11", patient_id: "p1", patient: MOCK_PATIENTS[0],
    tipo_exame: "TC_ABDOME", modalidade: "CT", arquivo_nome: "tc_abdome_joao.dcm",
    status: "AGUARDANDO", urgencia: "ELETIVO",
    data_realizacao: ago(0, 30), data_analise_ia: undefined,
    solicitante: "Dr. André Costa", municipio_origem: "Maceió",
    observacoes: "Dor abdominal recorrente",
    ai_results: [], reports: [], created_at: ago(0, 30),
  },
];

// ── Fila do dashboard (view priorizada — sem laudados) ────────────────────────
export const MOCK_QUEUE: ExamQueueItem[] = MOCK_EXAMS
  .filter((e) => e.status !== "LAUDADO")
  .map((e) => ({
    id: e.id,
    paciente_nome: e.patient!.nome,
    paciente_municipio: e.patient!.municipio,
    tipo_exame: e.tipo_exame,
    status: e.status,
    urgencia: e.urgencia,
    data_realizacao: e.data_realizacao,
    arquivo_url: e.arquivo_url,
    ia_confianca: e.ai_results[0]?.confianca,
    ia_urgencia: e.ai_results[0]?.urgencia_sugerida,
    ia_achados: e.ai_results[0]?.achados,
  }))
  .sort((a, b) => {
    const ord = { CRITICO: 1, PRIORITARIO: 2, ELETIVO: 3 };
    return (ord[a.urgencia] - ord[b.urgencia]) ||
           (new Date(a.data_realizacao).getTime() - new Date(b.data_realizacao).getTime());
  });

// ── Stats do dashboard ────────────────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  total_exames: MOCK_EXAMS.length,
  fila: {
    criticos:    MOCK_QUEUE.filter((e) => e.urgencia === "CRITICO").length,
    prioritarios: MOCK_QUEUE.filter((e) => e.urgencia === "PRIORITARIO").length,
    eletivos:    MOCK_QUEUE.filter((e) => e.urgencia === "ELETIVO").length,
  },
  status: {
    aguardando:  MOCK_EXAMS.filter((e) => e.status === "AGUARDANDO").length,
    processando: MOCK_EXAMS.filter((e) => e.status === "PROCESSANDO").length,
    laudados:    MOCK_EXAMS.filter((e) => e.status === "LAUDADO").length,
  },
  ia: { taxa_concordancia_pct: 94, tempo_medio_analise_ms: 1620 },
};
