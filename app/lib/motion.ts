// Shared timings for the reveal sequence: sidebar cards flip one by one,
// then the result cards flip in once most of them have landed.

export const FLIP_STAGGER_S = 0.08;
export const MAX_STAGGERED_FLIPS = 10; // beyond this, the rest flip together

/** Delay (seconds) before the Nth voter's card flips. */
export function flipDelay(index: number) {
  return Math.min(index, MAX_STAGGERED_FLIPS) * FLIP_STAGGER_S;
}

/** Delay (seconds) before the results appear, given how many people voted. */
export function resultsDelay(voteCount: number) {
  return flipDelay(Math.max(voteCount - 1, 0)) + 0.25;
}
