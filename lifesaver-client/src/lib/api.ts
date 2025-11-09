import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
});

export interface ReportPayload {
  name: string;
  phone: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface Report extends ReportPayload {
  id: string;
  createdAt: string;
  geohash: string;
  attachmentUrl?: string;
}

export const fetchReports = async () => {
  const { data } = await api.get<Report[]>('/reports');
  return data;
};

export const submitReport = async (payload: ReportPayload & { attachment?: File | null }) => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('phone', payload.phone);
  formData.append('description', payload.description);
  formData.append('latitude', payload.latitude.toString());
  formData.append('longitude', payload.longitude.toString());

  if (payload.attachment) {
    formData.append('attachment', payload.attachment);
  }

  const { data } = await api.post<Report>('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
};
