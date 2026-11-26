import { apiClient } from './client';
import { ApiResponse, NetworkItem, PressListParams } from './types';

export async function getNetworks(
  params: PressListParams = {},
): Promise<ApiResponse<NetworkItem[]>> {
  const { data } = await apiClient.get<ApiResponse<NetworkItem[]>>(
    '/networks',
    {
      params: {
        ...(params.page !== undefined ? { page: params.page } : {}),
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      },
    },
  );
  return data;
}

export async function getNetworkById(
  id: string,
): Promise<ApiResponse<NetworkItem>> {
  const { data } = await apiClient.get<ApiResponse<NetworkItem>>(
    `/networks/${id}`,
  );
  return data;
}
