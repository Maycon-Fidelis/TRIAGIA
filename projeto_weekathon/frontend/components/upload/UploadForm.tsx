"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patientsApi, examsApi } from "@/lib/api";
import { EXAM_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileImage,
  X,
  CheckCircle2,
  Loader2,
  UserPlus,
  Search,
} from "lucide-react";

const EXAM_TYPES = Object.entries(EXAM_TYPE_LABELS);

type Step = "patient" | "file" | "confirm";

export default function UploadForm() {
  const router = useRouter();

  // Etapas do formulário
  const [step, setStep] = useState<Step>("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dados do paciente
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [newPatient, setNewPatient] = useState({
    nome: "", cpf: "", municipio: "", sexo: "", data_nascimento: "",
  });
  const [isNewPatient, setIsNewPatient] = useState(false);

  // Dados do exame
  const [tipoExame, setTipoExame] = useState("RX_TORAX");
  const [solicitante, setSolicitante] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [municipioOrigem, setMunicipioOrigem] = useState("");

  // Arquivo
  const [file, setFile] = useState<File | null>(null);

  // Busca pacientes
  const { data: patients } = useQuery({
    queryKey: ["patients-search", patientSearch],
    queryFn: () => patientsApi.list(patientSearch),
    enabled: patientSearch.length >= 2,
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".bmp"],
      "application/dicom": [".dcm"],
      "": [".dcm"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError("");

    try {
      let patientId = selectedPatientId;

      // Cria paciente novo se necessário
      if (isNewPatient) {
        if (!newPatient.nome.trim()) throw new Error("Nome do paciente é obrigatório");
        const created = await patientsApi.create(newPatient);
        patientId = created.id;
      }

      if (!patientId) throw new Error("Selecione ou cadastre um paciente");

      const form = new FormData();
      form.append("patient_id", patientId);
      form.append("tipo_exame", tipoExame);
      form.append("file", file);
      if (solicitante) form.append("solicitante", solicitante);
      if (observacoes) form.append("observacoes", observacoes);
      if (municipioOrigem) form.append("municipio_origem", municipioOrigem);

      const exam = await examsApi.upload(form);
      router.push(`/exams/${exam.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Erro ao enviar exame");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvancePatient = isNewPatient ? !!newPatient.nome.trim() : !!selectedPatientId;
  const canAdvanceFile = !!file;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["patient", "file", "confirm"] as Step[]).map((s, i) => {
          const labels = ["Paciente", "Exame", "Confirmar"];
          const done = step === "file" ? i === 0 : step === "confirm" ? i < 2 : false;
          const active = step === s;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
              )}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-sm font-medium", active ? "text-blue-700" : "text-gray-400")}>
                {labels[i]}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
            </div>
          );
        })}
      </div>

      {/* ETAPA 1 — Paciente */}
      {step === "patient" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Identificação do Paciente</h2>

          <div className="flex gap-3">
            <button
              onClick={() => { setIsNewPatient(false); setSelectedPatientId(""); }}
              className={cn("flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                !isNewPatient ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
            >
              <Search className="w-4 h-4 inline mr-1.5" /> Buscar existente
            </button>
            <button
              onClick={() => setIsNewPatient(true)}
              className={cn("flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                isNewPatient ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" /> Cadastrar novo
            </button>
          </div>

          {!isNewPatient ? (
            <div>
              <input
                value={patientSearch}
                onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatientId(""); }}
                placeholder="Nome ou CPF do paciente…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              />
              {patients && patients.length > 0 && (
                <ul className="mt-1 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {patients.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => { setSelectedPatientId(p.id); setSelectedPatientName(p.nome); setPatientSearch(p.nome); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors",
                          selectedPatientId === p.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                        )}
                      >
                        <span className="font-medium">{p.nome}</span>
                        {p.municipio && <span className="text-gray-400 ml-2 text-xs">— {p.municipio}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {patientSearch.length >= 2 && patients?.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Nenhum paciente encontrado. Cadastre um novo.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome completo *</label>
                <input
                  value={newPatient.nome}
                  onChange={(e) => setNewPatient({ ...newPatient, nome: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  placeholder="Nome do paciente"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CPF</label>
                <input
                  value={newPatient.cpf}
                  onChange={(e) => setNewPatient({ ...newPatient, cpf: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Somente números"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sexo</label>
                <select
                  value={newPatient.sexo}
                  onChange={(e) => setNewPatient({ ...newPatient, sexo: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">—</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Data de nascimento</label>
                <input
                  type="date"
                  value={newPatient.data_nascimento}
                  onChange={(e) => setNewPatient({ ...newPatient, data_nascimento: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Município</label>
                <input
                  value={newPatient.municipio}
                  onChange={(e) => setNewPatient({ ...newPatient, municipio: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ex: Maceió"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setStep("file")}
            disabled={!canAdvancePatient}
            className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próximo →
          </button>
        </div>
      )}

      {/* ETAPA 2 — Exame e arquivo */}
      {step === "file" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Dados do Exame</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de exame *</label>
            <select
              value={tipoExame}
              onChange={(e) => setTipoExame(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            >
              {EXAM_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Médico solicitante</label>
              <input
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                placeholder="Dr(a). Nome"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Município de origem</label>
              <input
                value={municipioOrigem}
                onChange={(e) => setMunicipioOrigem(e.target.value)}
                placeholder="Cidade do exame"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Observações clínicas</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Hipótese diagnóstica, histórico relevante…"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragActive ? "border-blue-400 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB — clique para trocar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-auto text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <FileImage className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium text-sm">
                  {isDragActive ? "Solte o arquivo aqui" : "Arraste ou clique para selecionar"}
                </p>
                <p className="text-xs text-gray-400 mt-1">DICOM (.dcm), JPG, PNG — máx. 50 MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("patient")}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep("confirm")}
              disabled={!canAdvanceFile}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3 — Confirmação */}
      {step === "confirm" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Confirmar Envio</h2>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Paciente</span>
              <span className="font-medium text-gray-800">
                {isNewPatient ? newPatient.nome : selectedPatientName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tipo de exame</span>
              <span className="font-medium text-gray-800">{EXAM_TYPE_LABELS[tipoExame]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Arquivo</span>
              <span className="font-medium text-gray-800">{file?.name}</span>
            </div>
            {solicitante && (
              <div className="flex justify-between">
                <span className="text-gray-500">Solicitante</span>
                <span className="font-medium text-gray-800">{solicitante}</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            Após o envio, a IA analisará o exame automaticamente em segundo plano.
            Você será redirecionado para acompanhar o resultado.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("file")}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar e analisar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
