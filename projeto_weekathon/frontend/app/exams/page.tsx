"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { examsApi } from "@/lib/api";
import { EXAM_TYPE_LABELS, STATUS_CONFIG } from "@/lib/types";
import UrgencyBadge from "@/components/dashboard/UrgencyBadge";
import { formatDate, cn } from "@/lib/utils";
import { ChevronRight, Filter } from "lucide-react";
import { useState } from "react";

export default function ExamsPage() {
  const router = useRouter();
  const [urgenciaFilter, setUrgenciaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams", urgenciaFilter, statusFilter],
    queryFn: () => examsApi.list({ urgencia: urgenciaFilter || undefined, status_filter: statusFilter || undefined }),
    refetchInterval: 15_000,
  });

  return (
    <div className="p-6 max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Todos os Exames</h1>
          <p className="text-sm text-gray-500 mt-0.5">{exams?.length ?? 0} registros</p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={urgenciaFilter}
            onChange={(e) => setUrgenciaFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-blue-400"
          >
            <option value="">Todas urgências</option>
            <option value="CRITICO">Crítico</option>
            <option value="PRIORITARIO">Prioritário</option>
            <option value="ELETIVO">Eletivo</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-blue-400"
          >
            <option value="">Todos status</option>
            <option value="AGUARDANDO">Aguardando</option>
            <option value="PROCESSANDO">Processando</option>
            <option value="ANALISADO">Analisado</option>
            <option value="LAUDADO">Laudado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Urgência</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 hidden md:table-cell">Exame</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 hidden lg:table-cell">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {[1,2,3,4,5].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : exams?.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      Nenhum exame encontrado
                    </td>
                  </tr>
                )
                : exams?.map((exam) => (
                    <tr
                      key={exam.id}
                      onClick={() => router.push(`/exams/${exam.id}`)}
                      className={cn(
                        "border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50",
                        exam.urgencia === "CRITICO" && "bg-red-50/40 hover:bg-red-50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <UrgencyBadge urgency={exam.urgencia} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {exam.patient?.nome ?? "—"}
                        {exam.patient?.municipio && (
                          <span className="block text-xs text-gray-400 font-normal">
                            {exam.patient.municipio}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {EXAM_TYPE_LABELS[exam.tipo_exame] ?? exam.tipo_exame}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(exam.data_realizacao)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium", STATUS_CONFIG[exam.status]?.color)}>
                          {STATUS_CONFIG[exam.status]?.label}
                        </span>
                      </td>
                      <td className="px-3">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
