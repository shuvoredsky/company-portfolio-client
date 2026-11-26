export const RECRUITMENT_MODAL_SESSION_KEY = 'recruitment_modal_seen';

/**
 * Deep link from the Home recruitment modal to the Recruitment list page,
 * expanding and scrolling to the matching opening when present on the page.
 */
export function buildRecruitmentItemPath(id: string): string {
  return `/recruitment?open=${encodeURIComponent(id)}`;
}

/**
 * Deep link from a Recruitment opening to the Contact Us page,
 * allowing Client Prompt 5 to prefill the inquiry message with the position title.
 */
export function buildApplyContactPath(positionTitle: string): string {
  return `/contact?position=${encodeURIComponent(positionTitle)}`;
}
