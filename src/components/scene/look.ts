import * as THREE from "three";

/* the particle scene's look, shared by the scroll story (SceneStage) and the
   footer's ring (FooterOrbit) */

/* sampled from the Figma hero (node 47:138), same as the 3D prologue; raw sRGB */
export const C = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
};
export const PALETTE = {
  indigo: "#7f87f2",
  teal: "#8fe3e4",
  arc: "#9df3a6",
  violet: "#7d7bf0",
  dust: "#d9f2e0",
  red: "#ff3b2e", // the prologue's signal red: globe flecks, robot, cursor
};

/** premultiplied "over": dots cover one another, so colour holds */
export const BLEND = {
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
} as const;
