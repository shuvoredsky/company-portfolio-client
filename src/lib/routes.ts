export const RECRUITMENT_MODAL_SESSION_KEY = 'recruitment_modal_seen';

/**
 * Centralized route helpers for cross-page deep links.
 * Client Prompt 4 will read `?open=<id>` on /[lang]/recruitment to expand/highlight the opening.
 */
export function buildRecruitmentItemPath(id: string): string {
  return `/recruitment?open=${encodeURIComponent(id)}`;
}
