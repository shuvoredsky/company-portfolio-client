import { apiClient } from './client';
import { ApiResponse, PressItem, PressListParams } from './types';

/**
 * Backend stores these under /blogs; the public client displays them as "Press".
 */
export async function getPressList(
  params: PressListParams = {},
): Promise<ApiResponse<PressItem[]>> {
  const { data } = await apiClient.get<ApiResponse<PressItem[]>>('/blogs', {
    params: {
      ...(params.page !== undefined ? { page: params.page } : {}),
      ...(params.limit !== undefined ? { limit: params.limit } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });
  return data;
}

export async function getPressById(
  id: string,
): Promise<ApiResponse<PressItem>> {
  const { data } = await apiClient.get<ApiResponse<PressItem>>(`/blogs/${id}`);
  return data;
}
