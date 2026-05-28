-- RadIA — Dados de mock para demonstração
-- Limpa dados existentes e re-insere com IDs fixos para garantir consistência

-- ── Limpa na ordem correta (FK) ───────────────────────────────────────────────
TRUNCATE reports, ai_results, exams, patients RESTART IDENTITY CASCADE;

-- ── Pacientes ────────────────────────────────────────────────────────────────
INSERT INTO patients (id, nome, cpf, data_nascimento, sexo, telefone, municipio) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'João da Silva Santos',       '12345678901', '1965-03-15', 'M', '(82) 99123-4567', 'Maceió'),
  ('a1000000-0000-0000-0000-000000000002', 'Maria Aparecida Costa',      '98765432100', '1980-07-22', 'F', '(82) 99234-5678', 'Arapiraca'),
  ('a1000000-0000-0000-0000-000000000003', 'Francisco Alves Lima',       '11122233344', '1945-11-08', 'M', '(82) 99345-6789', 'Palmeira dos Índios'),
  ('a1000000-0000-0000-0000-000000000004', 'Ana Beatriz Ferreira',       '55566677788', '1992-04-30', 'F', '(82) 99456-7890', 'União dos Palmares'),
  ('a1000000-0000-0000-0000-000000000005', 'Pedro Henrique Souza',       '99988877766', '1955-09-12', 'M', '(82) 99567-8901', 'Penedo'),
  ('a1000000-0000-0000-0000-000000000006', 'Luciana Rodrigues Melo',     '33344455566', '1978-01-19', 'F', '(82) 99678-9012', 'Santana do Ipanema'),
  ('a1000000-0000-0000-0000-000000000007', 'Carlos Eduardo Nunes',       '77788899900', '1938-06-03', 'M', '(82) 99789-0123', 'São Miguel dos Campos'),
  ('a1000000-0000-0000-0000-000000000008', 'Fernanda Lima Cavalcante',   '22233344455', '2000-12-25', 'F', '(82) 99890-1234', 'Delmiro Gouveia'),
  ('a1000000-0000-0000-0000-000000000009', 'Roberto Gomes de Andrade',   '66677788899', '1971-08-14', 'M', '(82) 99901-2345', 'Marechal Deodoro'),
  ('a1000000-0000-0000-0000-000000000010', 'Patrícia Vieira Nascimento', '44455566677', '1988-03-07', 'F', '(82) 99012-3456', 'Coruripe');

-- ── Exames ───────────────────────────────────────────────────────────────────
INSERT INTO exams (id, patient_id, tipo_exame, modalidade, arquivo_nome, status, urgencia,
                   data_realizacao, data_analise_ia, solicitante, municipio_origem, observacoes) VALUES

  -- CRÍTICOS — aguardando laudo
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'RX_TORAX', 'CR', 'rx_torax_joao_001.dcm', 'ANALISADO', 'CRITICO',
   NOW() - INTERVAL '2 hours',  NOW() - INTERVAL '1 hour 50 min',
   'Dr. Renato Borges', 'Maceió', 'Paciente com dispneia intensa e queda de saturação'),

  ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003',
   'TC_CRANIO', 'CT', 'tc_cranio_francisco_001.dcm', 'ANALISADO', 'CRITICO',
   NOW() - INTERVAL '3 hours',  NOW() - INTERVAL '2 hours 45 min',
   'Dra. Silvia Martins', 'Palmeira dos Índios', 'TCE grave após acidente de moto, GCS 9'),

  ('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007',
   'TC_TORAX', 'CT', 'tc_torax_carlos_001.dcm', 'ANALISADO', 'CRITICO',
   NOW() - INTERVAL '1 hour',   NOW() - INTERVAL '45 min',
   'Dr. Marcelo Farias', 'São Miguel dos Campos', 'Dor torácica súbita, suspeita de TEP'),

  -- PRIORITÁRIOS
  ('b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002',
   'RX_TORAX', 'CR', 'rx_torax_maria_001.dcm', 'ANALISADO', 'PRIORITARIO',
   NOW() - INTERVAL '5 hours',  NOW() - INTERVAL '4 hours 50 min',
   'Dr. André Costa', 'Arapiraca', 'Tosse produtiva há 3 semanas, febre vespertina'),

  ('b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006',
   'RX_COLUNA', 'CR', 'rx_coluna_luciana_001.dcm', 'ANALISADO', 'PRIORITARIO',
   NOW() - INTERVAL '6 hours',  NOW() - INTERVAL '5 hours 30 min',
   'Dra. Camila Rocha', 'Santana do Ipanema', 'Lombalgia aguda após queda de altura'),

  ('b2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000009',
   'TC_CRANIO', 'CT', 'tc_cranio_roberto_001.dcm', 'ANALISADO', 'PRIORITARIO',
   NOW() - INTERVAL '4 hours',  NOW() - INTERVAL '3 hours 40 min',
   'Dr. Lucas Mendes', 'Marechal Deodoro', 'Cefaleia intensa de início súbito'),

  -- ELETIVOS
  ('b2000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004',
   'RX_MEMBROS', 'CR', 'rx_membro_ana_001.dcm', 'ANALISADO', 'ELETIVO',
   NOW() - INTERVAL '8 hours',  NOW() - INTERVAL '7 hours 30 min',
   'Dr. Paulo Ribeiro', 'União dos Palmares', 'Dor no joelho direito há 2 meses'),

  ('b2000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008',
   'RX_TORAX', 'CR', 'rx_torax_fernanda_001.dcm', 'ANALISADO', 'ELETIVO',
   NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11 hours 45 min',
   'Dra. Juliana Azevedo', 'Delmiro Gouveia', 'Check-up pré-operatório'),

  -- LAUDADOS
  ('b2000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005',
   'RX_TORAX', 'CR', 'rx_torax_pedro_001.dcm', 'LAUDADO', 'PRIORITARIO',
   NOW() - INTERVAL '2 days',   NOW() - INTERVAL '2 days' + INTERVAL '20 min',
   'Dr. Renato Borges', 'Penedo', 'Controle pós pneumonia'),

  ('b2000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000010',
   'RM_JOELHO', 'MR', 'rm_joelho_patricia_001.dcm', 'LAUDADO', 'ELETIVO',
   NOW() - INTERVAL '3 days',   NOW() - INTERVAL '3 days' + INTERVAL '30 min',
   'Dra. Camila Rocha', 'Coruripe', 'Dor crônica no joelho, suspeita de lesão meniscal'),

  -- AGUARDANDO processamento
  ('b2000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001',
   'TC_ABDOME', 'CT', 'tc_abdome_joao_002.dcm', 'AGUARDANDO', 'ELETIVO',
   NOW() - INTERVAL '30 min', NULL,
   'Dr. André Costa', 'Maceió', 'Dor abdominal recorrente');

-- ── Resultados da IA ─────────────────────────────────────────────────────────
INSERT INTO ai_results (exam_id, modelo_ia, versao_modelo, urgencia_sugerida, confianca,
                        achados, score_bruto, tempo_processamento_ms, created_at) VALUES

  ('b2000000-0000-0000-0000-000000000001', 'RadIA-HeuristicV1', '1.0.0', 'CRITICO', 0.9200,
   '[{"descricao":"Opacidade bilateral extensa compatível com edema pulmonar agudo","regiao":"ambos os pulmões","confianca":0.91,"severidade":"alta"},{"descricao":"Derrame pleural maciço com atelectasia compressiva","regiao":"hemitórax esquerdo","confianca":0.87,"severidade":"alta"}]',
   0.8500, 1230, NOW() - INTERVAL '1 hour 50 min'),

  ('b2000000-0000-0000-0000-000000000002', 'RadIA-HeuristicV1', '1.0.0', 'CRITICO', 0.9500,
   '[{"descricao":"Hematoma subdural agudo com espessura > 10mm e desvio de linha média","regiao":"convexidade cerebral","confianca":0.96,"severidade":"alta"},{"descricao":"Hemorragia subaracnóidea extensa com sangue nas cisternas basais","regiao":"espaço subaracnóide","confianca":0.94,"severidade":"alta"}]',
   0.9100, 2450, NOW() - INTERVAL '2 hours 45 min'),

  ('b2000000-0000-0000-0000-000000000003', 'RadIA-HeuristicV1', '1.0.0', 'CRITICO', 0.9400,
   '[{"descricao":"Tromboembolismo pulmonar bilateral com sinal de cor pulmonale agudo","regiao":"artérias pulmonares principais","confianca":0.95,"severidade":"alta"},{"descricao":"Derrame pericárdico volumoso com sinais de tamponamento cardíaco","regiao":"saco pericárdico","confianca":0.93,"severidade":"alta"}]',
   0.8800, 2100, NOW() - INTERVAL '45 min'),

  ('b2000000-0000-0000-0000-000000000004', 'RadIA-HeuristicV1', '1.0.0', 'PRIORITARIO', 0.8200,
   '[{"descricao":"Opacidade focal em lobo inferior direito compatível com pneumonia bacteriana","regiao":"lobo inferior direito","confianca":0.82,"severidade":"media"},{"descricao":"Derrame pleural moderado à esquerda sem sinais de loculação","regiao":"hemitórax esquerdo","confianca":0.78,"severidade":"media"}]',
   0.6800, 1180, NOW() - INTERVAL '4 hours 50 min'),

  ('b2000000-0000-0000-0000-000000000005', 'RadIA-HeuristicV1', '1.0.0', 'PRIORITARIO', 0.8600,
   '[{"descricao":"Fratura vertebral por compressão com acunhamento anterior > 30%","regiao":"corpo vertebral","confianca":0.86,"severidade":"media"}]',
   0.6500, 980, NOW() - INTERVAL '5 hours 30 min'),

  ('b2000000-0000-0000-0000-000000000006', 'RadIA-HeuristicV1', '1.0.0', 'PRIORITARIO', 0.7900,
   '[{"descricao":"Lesão expansiva com captação de contraste sugestiva de processo neoplásico","regiao":"região parietal","confianca":0.83,"severidade":"media"},{"descricao":"Hidrocefalia obstrutiva com aumento do sistema ventricular","regiao":"ventrículos laterais","confianca":0.81,"severidade":"media"}]',
   0.5900, 2300, NOW() - INTERVAL '3 hours 40 min'),

  ('b2000000-0000-0000-0000-000000000007', 'RadIA-HeuristicV1', '1.0.0', 'ELETIVO', 0.9200,
   '[{"descricao":"Exame sem evidência de lesões ósseas ou de partes moles","regiao":"geral","confianca":0.93,"severidade":"baixa"}]',
   0.2100, 870, NOW() - INTERVAL '7 hours 30 min'),

  ('b2000000-0000-0000-0000-000000000008', 'RadIA-HeuristicV1', '1.0.0', 'ELETIVO', 0.9000,
   '[{"descricao":"Exame dentro dos limites da normalidade para a faixa etária","regiao":"geral","confianca":0.92,"severidade":"baixa"}]',
   0.1800, 1050, NOW() - INTERVAL '11 hours 45 min'),

  ('b2000000-0000-0000-0000-000000000009', 'RadIA-HeuristicV1', '1.0.0', 'PRIORITARIO', 0.7700,
   '[{"descricao":"Cardiomegalia significativa (ICT > 0,55) com congestão pulmonar","regiao":"sombra cardíaca","confianca":0.80,"severidade":"media"},{"descricao":"Acentuação da trama vascular broncovascular bilateral","regiao":"campos pulmonares","confianca":0.80,"severidade":"media"}]',
   0.5500, 1140, NOW() - INTERVAL '2 days' + INTERVAL '20 min'),

  ('b2000000-0000-0000-0000-000000000010', 'RadIA-HeuristicV1', '1.0.0', 'ELETIVO', 0.8800,
   '[{"descricao":"Exame sem evidência de lesões ósseas ou de partes moles","regiao":"geral","confianca":0.93,"severidade":"baixa"}]',
   0.2300, 3200, NOW() - INTERVAL '3 days' + INTERVAL '30 min');

-- ── Laudos dos radiologistas ─────────────────────────────────────────────────
INSERT INTO reports (exam_id, radiologist_name, crm, laudo, urgencia_final, confirma_ia, data_laudo) VALUES

  ('b2000000-0000-0000-0000-000000000009',
   'Dr. Renato Borges', 'CRM-AL 12345',
   'Radiografia de tórax em PA e perfil. Observa-se cardiomegalia moderada com índice cardiotorácico de 0,57. Aumento da trama vascular pulmonar bilateral compatível com congestão venosa pulmonar leve a moderada. Seios costofrênicos livres. Não há consolidações parenquimatosas. Impressão: cardiomegalia com sinais de congestão pulmonar leve. Recomendo acompanhamento cardiológico.',
   'PRIORITARIO', true, NOW() - INTERVAL '1 day 20 hours'),

  ('b2000000-0000-0000-0000-000000000010',
   'Dra. Camila Rocha', 'CRM-AL 54321',
   'Ressonância magnética do joelho direito sem contraste, nos planos coronal, sagital e axial, ponderações DP, T2 e T1. Menisco medial com sinal heterogêneo em corno posterior sugestivo de degeneração grau II, sem extensão à superfície articular. Ligamento cruzado anterior íntegro. Cartilagem articular preservada. Pequeno derrame articular. Impressão: degeneração meniscal grau II sem lesão estrutural franca. Conduta conservadora.',
   'ELETIVO', true, NOW() - INTERVAL '2 days 18 hours');
