import { cacheLife, cacheTag } from 'next/cache';
import { getBanners } from './banners';
import { getPressById, getPressList } from './blogs';
import {
  ApiError,
  type PaginationMeta,
  type PressItem,
  type PublicBanner,
} from './types';

export interface CachedResult<T> {
  data: T;
  error: boolean;
}

export interface CachedListResult<T> {
  data: T[];
  meta: PaginationMeta;
  error: boolean;
}

export interface CachedItemResult<T> {
  data: T | null;
  notFound: boolean;
  error: boolean;
}

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export function isValidObjectId(id: string): boolean {
  return OBJECT_ID_REGEX.test(id);
}

export async function getCachedBanners(): Promise<CachedResult<PublicBanner[]>> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag('banners');

  try {
    const res = await getBanners();
    return { data: res.data ?? [], error: false };
  } catch {
    return { data: [], error: true };
  }
}

export async function getCachedLatestPress(
  limit = 3,
): Promise<CachedResult<PressItem[]>> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag('press');

  try {
    const res = await getPressList({ page: 1, limit });
    return { data: res.data ?? [], error: false };
  } catch {
    return { data: [], error: true };
  }
}

export async function getCachedPressList(
  page: number,
  limit: number,
  search: string,
): Promise<CachedListResult<PressItem>> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag('press');

  const safePage = Number.isInteger(page) && page >= 1 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit >= 1 && limit <= 50 ? limit : 9;
  const safeSearch = search.trim().slice(0, 100);

  try {
    const res = await getPressList({
      page: safePage,
      limit: safeLimit,
      search: safeSearch || undefined,
    });
    const items = res.data ?? [];
    const meta: PaginationMeta = res.meta ?? {
      page: safePage,
      limit: safeLimit,
      total: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    };
    return { data: items, meta, error: false };
  } catch {
    return {
      data: [],
      meta: { page: safePage, limit: safeLimit, total: 0, totalPages: 0 },
      error: true,
    };
  }
}

export async function getCachedPressById(
  id: string,
): Promise<CachedItemResult<PressItem>> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag('press', `press-${id}`);

  if (!isValidObjectId(id)) {
    return { data: null, notFound: true, error: false };
  }

  try {
    const res = await getPressById(id);
    if (!res.data) {
      return { data: null, notFound: true, error: false };
    }
    return { data: res.data, notFound: false, error: false };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return { data: null, notFound: true, error: false };
    }
    return { data: null, notFound: false, error: true };
  }
}

export async function getCachedPressSitemapItems(): Promise<PressItem[]> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag('press');

  try {
    const first = await getPressList({ page: 1, limit: 50 });
    const items = [...(first.data ?? [])];
    const totalPages = first.meta?.totalPages ?? 1;

    if (totalPages >= 2) {
      const second = await getPressList({ page: 2, limit: 50 });
      items.push(...(second.data ?? []));
    }

    return items;
  } catch {
    return [];
  }
}
