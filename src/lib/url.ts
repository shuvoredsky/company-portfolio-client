export interface SafeExternalUrl {
  href: string;
  hostname: string;
}

/**
 * Validates that an external URL uses strictly http: or https: protocol.
 * Rejects javascript:, data:, mailto:, ftp:, and malformed strings.
 */
export function parseSafeExternalUrl(raw?: string | null): SafeExternalUrl | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname) {
      return null;
    }
    return {
      href: parsed.toString(),
      hostname: parsed.hostname.replace(/^www\./i, ''),
    };
  } catch {
    return null;
  }
}

