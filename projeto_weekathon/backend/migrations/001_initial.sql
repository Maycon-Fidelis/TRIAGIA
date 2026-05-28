-- RadIA — Schema inicial do banco de dados
-- Executado automaticamente pelo Docker na primeira inicialização

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipo de urgência
CREATE TYPE urgencia_level AS ENUM ('CRITICO', 'PRIORITARIO', 'ELETIVO');

-- Status do exame
CREATE TYPE exam_status AS ENUM ('AGUARDANDO', 'PROCESSANDO', 'ANALISADO', 'LAUDADO', 'ERRO');

-- Tipo de exame radiológico
CREATE TYPE exam_type AS ENUM (
    'RX_TORAX', 'RX_COLUNA', 'RX_MEMBROS', 'RX_ABDOME', 'RX_CRANIO',
    'TC_CRANIO', 'TC_TORAX', 'TC_ABDOME', 'TC_COLUNA',
    'RM_CRANIO', 'RM_COLUNA', 'RM_JOELHO',
    'OUTRO'
);

-- Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome        VARCHAR(255) NOT NULL,
    cpf         VARCHAR(11) UNIQUE,
    data_nascimento DATE,
    sexo        CHAR(1) CHECK (sexo IN ('M', 'F')),
    telefone    VARCHAR(20),
    municipio   VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exames
CREATE TABLE IF NOT EXISTS exams (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tipo_exame          exam_type NOT NULL,
    modalidade          VARCHAR(10),                   -- CR, CT, MR, DX (DICOM tags)
    arquivo_url         TEXT,                          -- URL da imagem convertida (PNG)
    arquivo_original_url TEXT,                         -- URL do arquivo original (DICOM ou imagem)
    arquivo_nome        VARCHAR(255),
    status              exam_status DEFAULT 'AGUARDANDO',
    urgencia            urgencia_level DEFAULT 'ELETIVO',
    data_realizacao     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_analise_ia     TIMESTAMP WITH TIME ZONE,
    solicitante         VARCHAR(255),
    observacoes         TEXT,
    municipio_origem    VARCHAR(100),
    task_id             VARCHAR(255),                  -- ID da task Celery
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resultados da IA (auditoria completa)
CREATE TABLE IF NOT EXISTS ai_results (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id                 UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    modelo_ia               VARCHAR(100) NOT NULL,
    versao_modelo           VARCHAR(20),
    urgencia_sugerida       urgencia_level NOT NULL,
    confianca               FLOAT NOT NULL CHECK (confianca BETWEEN 0 AND 1),
    achados                 JSONB NOT NULL DEFAULT '[]',  -- lista de achados com score
    score_bruto             FLOAT,                        -- score interno da IA para auditoria
    tempo_processamento_ms  INTEGER,
    imagem_processada_url   TEXT,                         -- imagem com heatmap/overlay
    metadata_dicom          JSONB DEFAULT '{}',           -- dados extraídos do DICOM
    metadata_modelo         JSONB DEFAULT '{}',           -- parâmetros do modelo
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laudos dos radiologistas
CREATE TABLE IF NOT EXISTS reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    radiologist_name    VARCHAR(255) NOT NULL,
    crm                 VARCHAR(30),
    laudo               TEXT NOT NULL,
    urgencia_final      urgencia_level NOT NULL,
    confirma_ia         BOOLEAN,                   -- o radiologista concordou com a IA?
    data_laudo          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance na fila priorizada
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_urgencia ON exams(urgencia);
CREATE INDEX IF NOT EXISTS idx_exams_data ON exams(data_realizacao);
CREATE INDEX IF NOT EXISTS idx_exams_patient ON exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_results_exam ON ai_results(exam_id);

-- View: fila priorizada (usada pelo dashboard)
CREATE OR REPLACE VIEW v_fila_priorizada AS
SELECT
    e.id,
    e.patient_id,
    p.nome AS paciente_nome,
    p.municipio AS paciente_municipio,
    e.tipo_exame,
    e.status,
    e.urgencia,
    e.data_realizacao,
    e.solicitante,
    e.arquivo_url,
    ar.confianca AS ia_confianca,
    ar.achados AS ia_achados,
    ar.urgencia_sugerida AS ia_urgencia,
    CASE
        WHEN e.urgencia = 'CRITICO'     THEN 1
        WHEN e.urgencia = 'PRIORITARIO' THEN 2
        ELSE                                 3
    END AS ordem_urgencia
FROM exams e
JOIN patients p ON e.patient_id = p.id
LEFT JOIN ai_results ar ON ar.exam_id = e.id
WHERE e.status NOT IN ('LAUDADO')
ORDER BY ordem_urgencia ASC, e.data_realizacao ASC;

-- Dados de demonstração (removível em produção)
INSERT INTO patients (nome, cpf, data_nascimento, sexo, municipio) VALUES
    ('João da Silva Santos', '12345678901', '1965-03-15', 'M', 'Maceió'),
    ('Maria Aparecida Costa', '98765432100', '1980-07-22', 'F', 'Arapiraca'),
    ('Francisco Alves Lima', '11122233344', '1945-11-08', 'M', 'Palmeira dos Índios'),
    ('Ana Beatriz Ferreira', '55566677788', '1992-04-30', 'F', 'União dos Palmares'),
    ('Pedro Henrique Souza', '99988877766', '1955-09-12', 'M', 'Penedo')
ON CONFLICT DO NOTHING;
