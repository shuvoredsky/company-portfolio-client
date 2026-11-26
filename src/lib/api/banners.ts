import { apiClient } from './client';
import { ApiResponse, PublicBanner } from './types';

export async function getBanners(): Promise<ApiResponse<PublicBanner[]>> {
  const { data } = await apiClient.get<ApiResponse<PublicBanner[]>>('/banners');
  return data;
}
