"use client";

import type { AIResult, Finding } from "@/lib/types";
import UrgencyBadge from "@/components/dashboard/UrgencyBadge";
import { formatConfidence, formatDate } from "@/lib/utils";
import { BrainCircuit, AlertCircle, MapPin, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SEV_CONFIG = {
  alta: { label: "Alta", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  media: { label: "Média", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  baixa: { label: "Baixa", color: "text-green-600", bg: "bg-green-50 border-green-200" },
};

function FindingCard({ finding }: { finding: Finding }) {
  const sev = SEV_CONFIG[finding.severidade] ?? SEV_CONFIG.baixa;
  return (
    <div className={cn("rounded-lg border p-3 text-sm", sev.bg)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-gray-800 leading-snug font-medium">{finding.descricao}</p>
        <span className={cn("flex-shrink-0 text-xs font-semibold", sev.color)}>
          {formatConfidence(finding.confianca)}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
        <MapPin className="w-3 h-3" />
        {finding.regiao}
        <span className="mx-1">·</span>
        <span className={sev.color}>Severidade {sev.label}</span>
      </div>
    </div>
  );
}

interface Props {
  aiResult?: AIResult;
  loading?: boolean;
  processingStatus?: string;
}

export default function AIFindings({ aiResult, loading, processingStatus }: Props) {
  if (loading || processingStatus === "AGUARDANDO" || processingStatus === "PROCESSANDO") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-blue-500 animate-pulse" />
          <div>
            <p className="font-semibold text-blue-800">IA analisando exame…</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Isso leva alguns segundos. A página atualiza automaticamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!aiResult) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">Resultado da IA não disponível para este exame.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Análise de IA</h3>
        </div>
        <UrgencyBadge urgency={aiResult.urgencia_sugerida} size="sm" />
      </div>

      <div className="p-5 space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {formatConfidence(aiResult.confianca)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Confiança</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {aiResult.tempo_processamento_ms
                ? `${(aiResult.tempo_processamento_ms / 1000).toFixed(1)}s`
                : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Tempo análise</p>
          </div>
        </div>

        {/* Achados */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Achados identificados
          </h4>
          {aiResult.achados.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum achado registrado.</p>
          ) : (
            <div className="space-y-2">
              {aiResult.achados.map((f, i) => (
                <FindingCard key={i} finding={f} />
              ))}
            </div>
          )}
        </div>

        {/* Modelo */}
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
          <p>Modelo: {aiResult.modelo_ia} v{aiResult.versao_modelo ?? "1.0"}</p>
          <p>Análise realizada em {formatDate(aiResult.created_at)}</p>
          <p className="text-amber-600 font-medium mt-1">
            Sugestão da IA — laudo final é responsabilidade do radiologista.
          </p>
        </div>
      </div>
    </div>
  );
}
