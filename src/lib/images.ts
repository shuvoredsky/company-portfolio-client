/**
 * Inserts Cloudinary delivery optimizations (f_auto, q_auto, c_limit, w_<width>)
 * into a res.cloudinary.com /upload/ URL. Falls back safely to the original URL
 * for any non-Cloudinary or unrecognized URL.
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  width = 1200,
): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') {
      return url;
    }

    const uploadMarker = '/upload/';
    const idx = parsed.pathname.indexOf(uploadMarker);
    if (idx === -1) {
      return url;
    }

    const afterUpload = parsed.pathname.slice(idx + uploadMarker.length);
    // Avoid duplicating transformations if f_auto is already present
    if (afterUpload.startsWith('f_auto')) {
      return url;
    }

    const transform = `f_auto,q_auto,w_${Math.max(100, Math.round(width))},c_limit`;
    parsed.pathname = `${parsed.pathname.slice(0, idx + uploadMarker.length)}${transform}/${afterUpload}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

