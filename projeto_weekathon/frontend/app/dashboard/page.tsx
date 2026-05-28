import StatsCards from "@/components/dashboard/StatsCards";
import ExamQueue from "@/components/dashboard/ExamQueue";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Fila priorizada por inteligência artificial — atualiza a cada 10 segundos
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Novo exame
        </Link>
      </div>

      <StatsCards />
      <ExamQueue />
    </div>
  );
}
