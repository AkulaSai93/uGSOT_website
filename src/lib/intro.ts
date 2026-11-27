/**
 * The home page's opening curtain (IntroCurtain) and the hero's entrance
 * share this: the hero holds its entrance until the curtain starts to lift,
 * then plays it as the page is uncovered. When there is no curtain (reduced
 * motion, or coming back to the home page within the site), it is "done" at
 * once.
 */
let done = false;
const waiting: (() => void)[] = [];

/** call `cb` once the curtain lifts (or at once, if it already has) */
export function whenIntroDone(cb: () => void) {
  if (done) cb();
  else waiting.push(cb);
}

/** whether the curtain has already played (or been skipped) on this load */
export const isIntroDone = () => done;

export function markIntroDone() {
  if (done) return;
  done = true;
  waiting.splice(0).forEach((cb) => cb());
}
