/**
 * Shared, mutable state between the scroll timelines (DOM) and the particle
 * scene (WebGL). Kept outside React on purpose: it is written and read every
 * frame and must never trigger re-renders. Ported from the 3D prologue.
 */
export const sceneState = {
  /** 0 → 1 : hero ring → Specializations' swirling cloud (hidden behind the
   *  full-screen campus film) */
  progress: 0,
  /** 0 → 1 : the cloud settles into the dotted globe (as the AI & ML rows
   *  scroll in) */
  globe: 0,
  /** 0 → 1 : globe → walking robot (Pathways arrives) */
  path: 0,
  /** 0 → 1 : robot walks left → right along the Pathways line */
  travel: 0,
  /** 0 → 1 : the scene hidden, while the campus film fills the screen at the
   *  end of the hero, so nothing shows through the film's soft bottom edge */
  veil: 0,
};
