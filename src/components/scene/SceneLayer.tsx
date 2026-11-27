"use client";

import dynamic from "next/dynamic";

/* WebGL, client only. The chunk (three.js and the scene) is requested as soon
   as this module runs in the browser, not when React gets round to rendering
   the layer after hydration, so the hero's bubbles show up sooner. */
const load = () => import("./SceneStage");
if (typeof window !== "undefined") void load();
const SceneStage = dynamic(load, { ssr: false });

export function SceneLayer() {
  return <SceneStage />;
}
