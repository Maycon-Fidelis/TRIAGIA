"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { examsApi } from "@/lib/api";
import {
  URGENCY_CONFIG,
  STATUS_CONFIG,
  EXAM_TYPE_LABELS,
  type ExamQueueItem,
} from "@/lib/types";
import UrgencyBadge from "./UrgencyBadge";
import { formatRelative, formatConfidence, cn } from "@/lib/utils";
import { MapPin, User, BrainCircuit, RefreshCw, ChevronRight } from "lucide-react";

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function QueueRow({ item, index }: { item: ExamQueueItem; index: number }) {
  const router = useRouter();
  const isCritical = item.urgencia === "CRITICO";

  return (
    <tr
      onClick={() => router.push(`/exams/${item.id}`)}
      className={cn(
        "border-b border-gray-100 cursor-pointer transition-colors",
        isCritical
          ? "bg-red-50/60 hover:bg-red-50"
          : "hover:bg-gray-50",
      )}
    >
      {/* Posição na fila */}
      <td className="px-4 py-3 text-center">
        <span
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
            isCritical ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600",
          )}
        >
          {index + 1}
        </span>
      </td>

      {/* Urgência */}
      <td className="px-4 py-3">
        <UrgencyBadge urgency={item.urgencia} size="sm" />
      </td>

      {/* Paciente */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-800 text-sm">{item.paciente_nome}</span>
          {item.paciente_municipio && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {item.paciente_municipio}
            </span>
          )}
        </div>
      </td>

      {/* Tipo de exame */}
      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
        {EXAM_TYPE_LABELS[item.tipo_exame] ?? item.tipo_exame}
      </td>

      {/* IA */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {item.ia_confianca != null ? (
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatConfidence(item.ia_confianca)}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Analisando…
          </span>
        )}
      </td>

      {/* Data */}
      <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
        {formatRelative(item.data_realizacao)}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={cn("text-xs font-medium", STATUS_CONFIG[item.status]?.color ?? "text-gray-500")}>
          {STATUS_CONFIG[item.status]?.label ?? item.status}
        </span>
      </td>

      <td className="px-3 py-3">
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </td>
    </tr>
  );
}

export default function ExamQueue() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["exam-queue"],
    queryFn: () => examsApi.getQueue(),
    refetchInterval: 10_000,
  });

  const criticos = data?.filter((e) => e.urgencia === "CRITICO") ?? [];
  const outros = data?.filter((e) => e.urgencia !== "CRITICO") ?? [];
  const ordered = [...criticos, ...outros];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">Fila de Exames</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ordenada por urgência — críticos aparecem primeiro
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Banner crítico */}
      {criticos.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {criticos.length} exame{criticos.length > 1 ? "s" : ""} crítico{criticos.length > 1 ? "s" : ""} aguardando leitura imediata
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-400 w-10">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Urgência</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Paciente</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 hidden md:table-cell">Exame</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 hidden lg:table-cell">IA</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 hidden sm:table-cell">Chegada</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : ordered.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <p className="text-lg font-medium">Fila vazia</p>
                    <p className="text-sm mt-1">Nenhum exame aguardando leitura</p>
                  </td>
                </tr>
              )
              : ordered.map((item, i) => <QueueRow key={item.id} item={item} index={i} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
