"use client";

import dynamic from "next/dynamic";

/* WebGL, client only: loads after first paint so the copy is never held up */
const SceneStage = dynamic(() => import("./SceneStage"), { ssr: false });

export function SceneLayer() {
  return <SceneStage />;
}
