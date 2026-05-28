"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MOCK_EXAMS } from "@/lib/mock-data";
import { EXAM_TYPE_LABELS, STATUS_CONFIG, URGENCY_CONFIG, type UrgencyLevel } from "@/lib/types";
import UrgencyBadge from "@/components/dashboard/UrgencyBadge";
import ExamViewer from "@/components/exam/ExamViewer";
import AIFindings from "@/components/exam/AIFindings";
import { formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  // Polling enquanto a IA está processando
  const [polling, setPolling] = useState(true);

  const { data: exam, isLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn: async () => MOCK_EXAMS.find((e) => e.id === id) ?? null,
  });

  useEffect(() => {
    if (exam && !["AGUARDANDO", "PROCESSANDO"].includes(exam.status)) {
      setPolling(false);
    }
  }, [exam]);

  // Formulário de laudo
  const [laudoText, setLaudoText] = useState("");
  const [radiologistName, setRadiologistName] = useState("");
  const [crm, setCrm] = useState("");
  const [urgenciaFinal, setUrgenciaFinal] = useState<UrgencyLevel>("ELETIVO");
  const [confirmaIA, setConfirmaIA] = useState<boolean | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: Parameters<typeof import("@/lib/api").reportsApi.create>[0]) => {
      // mock: injeta o laudo no exame em memória
      const target = MOCK_EXAMS.find((e) => e.id === data.exam_id);
      if (target) {
        const report = {
          id: `r-${Date.now()}`,
          exam_id: data.exam_id!,
          radiologist_name: data.radiologist_name!,
          crm: data.crm,
          laudo: data.laudo!,
          urgencia_final: data.urgencia_final!,
          confirma_ia: data.confirma_ia,
          data_laudo: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        target.reports = [report];
        target.status = "LAUDADO";
      }
      return target?.reports[0]!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam", id] });
      qc.invalidateQueries({ queryKey: ["exam-queue"] });
    },
  });

  useEffect(() => {
    if (exam?.ai_results?.[0]) {
      setUrgenciaFinal(exam.ai_results[0].urgencia_sugerida as UrgencyLevel);
    }
  }, [exam]);

  const latestAI = exam?.ai_results?.at(-1);
  const latestReport = exam?.reports?.at(-1);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="p-6 max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">
              {EXAM_TYPE_LABELS[exam.tipo_exame] ?? exam.tipo_exame}
            </h1>
            <UrgencyBadge urgency={exam.urgencia} size="md" />
            <span className={cn("text-sm font-medium", STATUS_CONFIG[exam.status]?.color)}>
              {STATUS_CONFIG[exam.status]?.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {exam.patient?.nome}
            </span>
            {exam.patient?.municipio && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {exam.patient.municipio}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(exam.data_realizacao)}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visor de imagem */}
        <div className="space-y-4">
          <ExamViewer
            imageUrl={exam.arquivo_url}
            patientName={exam.patient?.nome}
            examType={EXAM_TYPE_LABELS[exam.tipo_exame]}
          />

          {/* Informações clínicas */}
          {(exam.solicitante || exam.observacoes) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
              {exam.solicitante && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 flex-shrink-0">Solicitante</span>
                  <span className="text-gray-700">{exam.solicitante}</span>
                </div>
              )}
              {exam.observacoes && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 flex-shrink-0">Observações</span>
                  <span className="text-gray-700">{exam.observacoes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Painel IA + Laudo */}
        <div className="space-y-4">
          <AIFindings
            aiResult={latestAI}
            loading={isLoading}
            processingStatus={exam.status}
          />

          {/* Laudo já emitido */}
          {latestReport ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-gray-800">Laudo Emitido</h3>
                <UrgencyBadge urgency={latestReport.urgencia_final as UrgencyLevel} size="sm" />
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {latestReport.laudo}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
                <p>Dr(a). {latestReport.radiologist_name}{latestReport.crm && ` — CRM ${latestReport.crm}`}</p>
                <p>{formatDate(latestReport.data_laudo)}</p>
                {latestReport.confirma_ia != null && (
                  <p className={latestReport.confirma_ia ? "text-green-600" : "text-amber-600"}>
                    {latestReport.confirma_ia
                      ? "✓ Concordou com a sugestão da IA"
                      : "↺ Divergiu da sugestão da IA"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Formulário de laudo */
            exam.status === "ANALISADO" && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Emitir Laudo
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Radiologista *</label>
                    <input
                      value={radiologistName}
                      onChange={(e) => setRadiologistName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CRM</label>
                    <input
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      placeholder="CRM/AL 000000"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Urgência final *</label>
                  <div className="flex gap-2">
                    {(["CRITICO", "PRIORITARIO", "ELETIVO"] as UrgencyLevel[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUrgenciaFinal(u)}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors",
                          urgenciaFinal === u
                            ? `${URGENCY_CONFIG[u].bg} ${URGENCY_CONFIG[u].border} ${URGENCY_CONFIG[u].color}`
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        {URGENCY_CONFIG[u].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Texto do laudo *</label>
                  <textarea
                    value={laudoText}
                    onChange={(e) => setLaudoText(e.target.value)}
                    placeholder="Descrição técnica dos achados e conclusão…"
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                {latestAI && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Concordou com a sugestão da IA?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmaIA(true)}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
                          confirmaIA === true ? "bg-green-50 border-green-400 text-green-700" : "border-gray-200 text-gray-500"
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sim
                      </button>
                      <button
                        onClick={() => setConfirmaIA(false)}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
                          confirmaIA === false ? "bg-amber-50 border-amber-400 text-amber-700" : "border-gray-200 text-gray-500"
                        )}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Não
                      </button>
                    </div>
                  </div>
                )}

                {mutation.isError && (
                  <p className="text-sm text-red-600">Erro ao salvar laudo. Tente novamente.</p>
                )}

                <button
                  onClick={() =>
                    mutation.mutate({
                      exam_id: exam.id,
                      radiologist_name: radiologistName,
                      crm,
                      laudo: laudoText,
                      urgencia_final: urgenciaFinal,
                      confirma_ia: confirmaIA ?? undefined,
                    })
                  }
                  disabled={!radiologistName || !laudoText || mutation.isPending}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {mutation.isPending ? "Salvando…" : "Assinar e salvar laudo"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
