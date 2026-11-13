import { api } from '@/lib/api-client';
import type { Donor, DonorListParams, DonorStats, RegisterDonorInput, UpdateDonationInput } from '../schemas/donor.schema';

export const donorApi = {
  list: (params: DonorListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Donor>('/donors', { ...params, limit: 12 }, signal),
  stats: (signal?: AbortSignal) => api.get<DonorStats>('/donors/stats', undefined, signal),
  register: ({ website: _hp, lastDonation, ...input }: RegisterDonorInput) =>
    api.post<Donor>('/donors', { ...input, lastDonation: lastDonation ? new Date(lastDonation).toISOString() : null }),
  updateLastDonation: (id: string, { phone, lastDonation }: UpdateDonationInput) =>
    api.patch<Donor>(`/donors/${id}/last-donation`, { phone, lastDonation: new Date(lastDonation).toISOString() }),
};
