import { apiClient } from './client';
import { ApiResponse, ContactPayload, ContactSubmitResult } from './types';

export async function submitContact(
  payload: ContactPayload,
): Promise<ApiResponse<ContactSubmitResult | null>> {
  const { data } = await apiClient.post<
    ApiResponse<ContactSubmitResult | null>
  >('/contacts', payload);
  return data;
}

