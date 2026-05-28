import axios from "axios";
import type {
  Patient,
  Exam,
  ExamQueueItem,
  Report,
  DashboardStats,
} from "./types";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
});

// ── Pacientes ──────────────────────────────────────────────────────────────
export const patientsApi = {
  list: (search?: string) =>
    api.get<Patient[]>("/patients/", { params: { search } }).then((r) => r.data),

  create: (data: Record<string, string | undefined>) =>
    api.post<Patient>("/patients/", data).then((r) => r.data),

  get: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then((r) => r.data),
};

// ── Exames ─────────────────────────────────────────────────────────────────
export const examsApi = {
  upload: (formData: FormData) =>
    api.post<Exam>("/exams/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }).then((r) => r.data),

  getQueue: (statusFilter?: string) =>
    api
      .get<ExamQueueItem[]>("/exams/queue", { params: { status_filter: statusFilter } })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Exam>(`/exams/${id}`).then((r) => r.data),

  getStatus: (id: string) =>
    api.get<{ status: string; urgencia: string }>(`/exams/${id}/status`).then((r) => r.data),

  list: (params?: { patient_id?: string; status_filter?: string; urgencia?: string }) =>
    api.get<Exam[]>("/exams/", { params }).then((r) => r.data),
};

// ── Laudos ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  create: (data: Partial<Report>) =>
    api.post<Report>("/reports/", data).then((r) => r.data),

  getForExam: (examId: string) =>
    api.get<Report[]>(`/reports/exam/${examId}`).then((r) => r.data),
};

// ── Estatísticas ───────────────────────────────────────────────────────────
export const statsApi = {
  dashboard: () =>
    api.get<DashboardStats>("/stats/dashboard").then((r) => r.data),
};

export default api;
