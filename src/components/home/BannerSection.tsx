import { getCachedBanners } from '@/lib/api/server';
import { BannerSlider } from './BannerSlider';

export async function BannerSection() {
  const { data: banners } = await getCachedBanners();
  return <BannerSlider banners={banners} />;
}

