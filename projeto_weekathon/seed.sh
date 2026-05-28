#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DC="docker compose -f $SCRIPT_DIR/docker-compose.yml"

echo "==> Subindo banco de dados..."
$DC up -d postgres

echo "==> Aguardando PostgreSQL ficar pronto..."
until $DC exec -T postgres pg_isready -U radia -d radia -q 2>/dev/null; do
  sleep 1
done
echo "    Banco pronto."

echo "==> Inserindo dados de mock (TRUNCATE + re-insert)..."
$DC exec -T postgres psql -U radia -d radia < "$SCRIPT_DIR/backend/migrations/002_seed.sql"

echo ""
echo "==> Resultado:"
$DC exec -T postgres psql -U radia -d radia -c "
  SELECT 'patients'   AS tabela, COUNT(*) AS total FROM patients
  UNION ALL
  SELECT 'exams',      COUNT(*) FROM exams
  UNION ALL
  SELECT 'ai_results', COUNT(*) FROM ai_results
  UNION ALL
  SELECT 'reports',    COUNT(*) FROM reports;
"

echo ""
echo "==> Subindo stack completa (backend + frontend)..."
$DC up -d

echo ""
echo "Pronto! Acesse:"
echo "  Frontend  -> http://localhost:3000"
echo "  Backend   -> http://localhost:8000/docs"
