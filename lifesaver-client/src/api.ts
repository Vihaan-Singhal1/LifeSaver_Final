import http from './lib/axios.ts';
import type { Report } from './types.ts';

type QueryValue = string | string[] | undefined;

export interface GetReportsParams {
  category?: QueryValue;
  urgency?: string;
  status?: string;
}

function normaliseCategoryParam(category?: QueryValue) {
  if (!category) return undefined;
  if (Array.isArray(category)) {
    return category.flatMap(value => value.split(',').map(item => item.trim()).filter(Boolean));
  }
  return category
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export async function getReports(params: GetReportsParams = {}) {
  const categories = normaliseCategoryParam(params.category);
  const query: Record<string, string | string[] | undefined> = {
    urgency: params.urgency,
    status: params.status
  };

  if (categories && categories.length > 0) {
    query.category = categories;
  }

  const { data } = await http.get<Report[]>('/reports', {
    params: query
  });

  return data;
}

export async function getReport(id: string) {
  const { data } = await http.get<Report>(`/reports/${id}`);
  return data;
}

type CreateReportPayload = FormData | Record<string, unknown>;

type PatchableFields = Partial<Pick<Report, 'status' | 'assignedTo' | 'text'>>;

export async function createReport(payload: CreateReportPayload) {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

  const { data } = await http.post<Report>('/reports', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });

  return data;
}

export async function updateReport(id: string, patch: PatchableFields) {
  const { data } = await http.patch<Report>(`/reports/${id}`, patch);
  return data;
}
