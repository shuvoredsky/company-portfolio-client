import { PaginationParams, PressListParams } from '@/lib/api/types';

export const queryKeys = {
  banners: {
    all: ['banners'] as const,
  },
  press: {
    all: ['press'] as const,
    list: (params: PressListParams) => ['press', 'list', params] as const,
    detail: (id: string) => ['press', 'detail', id] as const,
  },
  networks: {
    all: ['networks'] as const,
    list: (params: PressListParams) => ['networks', 'list', params] as const,
    detail: (id: string) => ['networks', 'detail', id] as const,
  },
  recruitments: {
    all: ['recruitments'] as const,
    list: (params: PaginationParams) =>
      ['recruitments', 'list', params] as const,
    detail: (id: string) => ['recruitments', 'detail', id] as const,
  },
} as const;

