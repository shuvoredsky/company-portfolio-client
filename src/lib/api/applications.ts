import { apiClient } from './client';
import { ApiResponse, ApplicationCheckResult } from './types';

/**
 * Checks application status via POST so serial numbers never appear in URLs or logs.
 */
export async function checkApplication(
  serialNumber: string,
): Promise<ApiResponse<ApplicationCheckResult>> {
  const { data } = await apiClient.post<ApiResponse<ApplicationCheckResult>>(
    '/applications/check',
    { serialNumber },
  );
  return data;
}

