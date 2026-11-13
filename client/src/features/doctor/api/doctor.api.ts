import { api } from '@/lib/api-client';
import { latin } from '@/lib/utils';
import type { Submission } from '@/types/api';
import type { CreateDoctorInput, Doctor, DoctorListParams, DoctorStats } from '../schemas/doctor.schema';

export const doctorApi = {
  list: (params: DoctorListParams & { page: number }, signal?: AbortSignal) =>
    api.getPaginated<Doctor>('/doctors', { ...params, limit: 12 }, signal),
  stats: (signal?: AbortSignal) => api.get<DoctorStats>('/doctors/stats', undefined, signal),
  getById: (id: string, signal?: AbortSignal) => api.get<Doctor>(`/doctors/${id}`, undefined, signal),
  create: (input: CreateDoctorInput) => {
    const { specialtyOther, degreesOther, website: _hp, ...rest } = input;
    return api.post<Submission>('/doctors', {
      ...rest,
      specialty: rest.specialty === 'অন্যান্য' && specialtyOther ? specialtyOther : rest.specialty,
      degrees: [...rest.degrees.filter((d) => d !== 'অন্যান্য'), ...(degreesOther ? degreesOther.split(',').map((d) => d.trim()).filter(Boolean) : [])],
      chambers: rest.chambers.map((c) => ({ ...c, fee: c.fee ? Number(latin(c.fee).replace(/\D/g, '')) : undefined, serial: c.serial || undefined })),
    });
  },
};
