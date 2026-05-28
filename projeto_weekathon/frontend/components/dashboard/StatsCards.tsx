"use client";

import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";
import { AlertTriangle, Clock, CheckCircle2, Activity } from "lucide-react";

function Card({
  title,
  value,
  sub,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.dashboard,
    refetchInterval: 15_000,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Críticos na fila"
        value={data?.fila.criticos ?? 0}
        sub="Atenção imediata"
        icon={AlertTriangle}
        color="bg-red-500"
        loading={isLoading}
      />
      <Card
        title="Prioritários"
        value={data?.fila.prioritarios ?? 0}
        sub="Preferência de leitura"
        icon={Clock}
        color="bg-amber-500"
        loading={isLoading}
      />
      <Card
        title="Eletivos"
        value={data?.fila.eletivos ?? 0}
        sub="Agenda regular"
        icon={CheckCircle2}
        color="bg-green-500"
        loading={isLoading}
      />
      <Card
        title="Aguardando IA"
        value={
          ((data?.status.aguardando ?? 0) + (data?.status.processando ?? 0))
        }
        sub={
          data?.ia.taxa_concordancia_pct != null
            ? `${data.ia.taxa_concordancia_pct}% concordância IA`
            : "Processando…"
        }
        icon={Activity}
        color="bg-blue-500"
        loading={isLoading}
      />
    </div>
  );
}
