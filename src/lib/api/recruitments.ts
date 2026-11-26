import { apiClient } from './client';
import { ApiResponse, PaginationParams, RecruitmentItem } from './types';

export async function getRecruitments(
  params: PaginationParams = {},
): Promise<ApiResponse<RecruitmentItem[]>> {
  const { data } = await apiClient.get<ApiResponse<RecruitmentItem[]>>(
    '/recruitments',
    {
      params: {
        ...(params.page !== undefined ? { page: params.page } : {}),
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
      },
    },
  );
  return data;
}

export async function getRecruitmentById(
  id: string,
): Promise<ApiResponse<RecruitmentItem>> {
  const { data } = await apiClient.get<ApiResponse<RecruitmentItem>>(
    `/recruitments/${id}`,
  );
  return data;
}
