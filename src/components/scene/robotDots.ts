import * as THREE from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * The Pathways robot, ported from the 3D prologue (RobotDots.tsx, there an
 * R3F component; here plain three.js): the three.js "RobotExpressive" model
 * (public domain, by Tomás Laulhé, public/models/robot.glb) playing its
 * Walking clip, drawn as dots like the rest of the scene. Dots are fixed
 * points on the model's surface (area-weighted), re-skinned every frame so
 * they ride the animation; the body is the hero ring's green, the joints mint,
 * the face dark; the far side dims so the shape reads clearly.
 *
 * Added to the particle entity's group, so it shares its position and scale:
 * normalised to ~4 units tall with its feet at y = -2 (the stage-2 frame).
 * The walk cycle is driven by how far it has travelled along the Pathways
 * line, so it steps as you scroll and stands still when you stop.
 */
const HEIGHT = 4.0;
const FEET_Y = -2.0;
const STRIDES = 7; // walk cycles across the line
const YAW = 0.85; // three-quarter view, facing right

const vert = /* glsl */ `
uniform float uSize;
uniform float uPixelRatio;
uniform float uReveal;
uniform float uTime;
attribute vec3 aColor;
attribute vec2 aRnd;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float on = smoothstep(aRnd.x, aRnd.x + 0.15, uReveal * 1.15);
  gl_PointSize = uSize * (0.8 + aRnd.y * 0.2) * on * uPixelRatio / -mv.z;
  // the far side of the body dims, so the near side reads as a clear shape
  // instead of both sides' dots piling into one blur
  float c = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float near = clamp((mv.z - c) / 0.9 * 0.5 + 0.5, 0.0, 1.0);
  vColor = aColor * (0.55 + 0.45 * near);
  vAlpha = on * (0.45 + 0.55 * near) * (0.92 + 0.08 * sin(uTime * 2.0 + aRnd.y * 40.0));
}`;

const frag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float a = max((1.0 - smoothstep(0.32, 0.5, d)) * 0.9, soft * soft) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);   // premultiplied
}`;

type Sample = {
  mesh: number;
  a: number;
  b: number;
  c: number;
  u: number;
  v: number;
};

/* raw sRGB, like the rest of the scene */
const COLORS: Record<string, [number, number, number]> = {
  Main: [0.31, 0.839, 0.627], // #4fd6a0, the body: the hero ring's green
  Grey: [0.706, 0.961, 0.788], // #b4f5c9, joints, hands, feet: its light mint
  Black: [0.09, 0.231, 0.18], // #173b2e, face visor: deep green, dim
};

function build(root: THREE.Object3D, count: number) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  root.updateMatrixWorld(true);

  // triangles of every mesh, in rest pose, weighted by area
  const tris: {
    mesh: number;
    a: number;
    b: number;
    c: number;
    area: number;
  }[] = [];
  const va = new THREE.Vector3(),
    vb = new THREE.Vector3(),
    vc = new THREE.Vector3();
  meshes.forEach((m, mi) => {
    const g = m.geometry;
    const idx = g.index;
    const n = idx ? idx.count : g.attributes.position.count;
    for (let t = 0; t < n; t += 3) {
      const a = idx ? idx.getX(t) : t,
        b = idx ? idx.getX(t + 1) : t + 1,
        c = idx ? idx.getX(t + 2) : t + 2;
      m.getVertexPosition(a, va).applyMatrix4(m.matrixWorld);
      m.getVertexPosition(b, vb).applyMatrix4(m.matrixWorld);
      m.getVertexPosition(c, vc).applyMatrix4(m.matrixWorld);
      const area = vb.sub(va).cross(vc.sub(va)).length() / 2;
      if (area > 0) tris.push({ mesh: mi, a, b, c, area });
    }
  });
  const cum: number[] = [];
  let total = 0;
  for (const t of tris) cum.push((total += t.area));

  const samples: Sample[] = [];
  const colors = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * total;
    let lo = 0,
      hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    const t = tris[lo];
    let u = Math.random(),
      v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    samples.push({ mesh: t.mesh, a: t.a, b: t.b, c: t.c, u, v });
    const mat = meshes[t.mesh].material as THREE.Material;
    const col = COLORS[mat.name] ?? COLORS.Grey;
    // a few white sparks across the red body, as on the globe
    const spark = mat.name === "Main" && Math.random() < 0.03;
    colors.set(spark ? COLORS.Grey : col, i * 3);
    rnd[i * 2] = Math.random() * 0.85;
    rnd[i * 2 + 1] = Math.random();
  }
  // the vertices the dots actually use, per mesh (skinned once per frame)
  const used = meshes.map(() => new Set<number>());
  for (const sm of samples) {
    used[sm.mesh].add(sm.a);
    used[sm.mesh].add(sm.b);
    used[sm.mesh].add(sm.c);
  }
  const verts = used.map((s) => Int32Array.from(s));
  const cache = meshes.map(
    (m) => new Float32Array(m.geometry.attributes.position.count * 3),
  );
  return { meshes, samples, colors, rnd, verts, cache };
}

export function createRobotDots(
  parent: THREE.Object3D,
  blending: Partial<THREE.ShaderMaterialParameters>,
) {
  let cancelled = false;
  let state: {
    root: THREE.Object3D;
    mixer: THREE.AnimationMixer;
    action: THREE.AnimationAction;
    meshes: THREE.Mesh[];
    samples: Sample[];
    verts: Int32Array[];
    cache: Float32Array[];
    points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
    walk: number;
  } | null = null;

  const count = window.innerWidth < 768 ? 5000 : 9000;
  // the robot only walks in Pathways, well down the page: its model is
  // fetched once the browser is idle, so it never competes with the hero
  const idle =
    window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
  idle(() => {
    if (cancelled) return;
    new GLTFLoader().load("/models/robot.glb", onModel);
  });
  function onModel(gltf: GLTF) {
    if (cancelled) return;
    const root = gltf.scene;

    // normalise: ~4 units tall, feet on y = -2, centred, turned to face right
    const box = new THREE.Box3().setFromObject(root, true);
    const k = HEIGHT / (box.max.y - box.min.y);
    root.scale.setScalar(k);
    root.position.set(
      -((box.min.x + box.max.x) / 2) * k,
      FEET_Y - box.min.y * k,
      -((box.min.z + box.max.z) / 2) * k,
    );
    root.rotation.y = YAW;

    const mixer = new THREE.AnimationMixer(root);
    const clip =
      gltf.animations.find((a) => a.name === "Walking") ?? gltf.animations[0];
    const action = mixer.clipAction(clip);
    action.play();
    action.paused = true;
    mixer.update(0);

    const { meshes, samples, colors, rnd, verts, cache } = build(root, count);
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 2));
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...blending,
      uniforms: {
        uSize: { value: 13 }, // fine, dense dots so the outline reads cleanly
        uPixelRatio: { value: 1 },
        uReveal: { value: 0 },
        uTime: { value: 0 },
      },
    });
    const points = new THREE.Points(g, material);
    points.frustumCulled = false;
    points.visible = false;
    parent.add(points);
    state = {
      root,
      mixer,
      action,
      meshes,
      samples,
      verts,
      cache,
      points,
      walk: 0,
    };
  }

  const v = new THREE.Vector3();

  return {
    /** reveal 0 → 1 fades the dots in; travel 0 → 1 is distance along the line */
    update(
      dt: number,
      time: number,
      pixelRatio: number,
      reveal: number,
      travel: number,
      /** which way it faces; the three-quarter view by default */
      yaw: number = YAW,
    ) {
      const s = state;
      if (!s) return;
      const u = s.points.material.uniforms;
      u.uReveal.value = reveal;
      u.uTime.value = time;
      u.uPixelRatio.value = pixelRatio;
      s.points.visible = reveal > 0.001;
      if (!s.points.visible) return;

      s.root.rotation.y = THREE.MathUtils.damp(s.root.rotation.y, yaw, 5, dt);

      // pose: the walk clip, scrubbed by distance travelled
      const dur = s.action.getClip().duration;
      s.walk = THREE.MathUtils.damp(s.walk, travel * STRIDES * dur, 6, dt);
      s.action.time = ((s.walk % dur) + dur) % dur;
      s.mixer.update(0);
      s.root.updateMatrixWorld(true);

      // skin the used vertices once, then place every dot inside its triangle
      s.meshes.forEach((m, mi) => {
        const out = s.cache[mi];
        const list = s.verts[mi];
        for (let j = 0; j < list.length; j++) {
          const k = list[j];
          m.getVertexPosition(k, v).applyMatrix4(m.matrixWorld);
          out[k * 3] = v.x;
          out[k * 3 + 1] = v.y;
          out[k * 3 + 2] = v.z;
        }
      });
      const pos = s.points.geometry.attributes
        .position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      let low = Infinity;
      for (let i = 0; i < s.samples.length; i++) {
        const sm = s.samples[i];
        const ca = s.cache[sm.mesh];
        const w = 1 - sm.u - sm.v;
        for (let d = 0; d < 3; d++)
          arr[i * 3 + d] =
            ca[sm.a * 3 + d] * w +
            ca[sm.b * 3 + d] * sm.u +
            ca[sm.c * 3 + d] * sm.v;
        if (arr[i * 3 + 1] < low) low = arr[i * 3 + 1];
      }
      // keep the lowest foot on the ground (y = FEET_Y) in every pose, so the
      // walk never lifts the robot off the line
      const drop = FEET_Y - low;
      for (let i = 0; i < s.samples.length; i++) arr[i * 3 + 1] += drop;
      pos.needsUpdate = true;
    },
    dispose() {
      cancelled = true;
      const s = state;
      if (s) {
        s.points.removeFromParent();
        s.points.geometry.dispose();
        s.points.material.dispose();
        s.mixer.stopAllAction();
      }
      state = null;
    },
  };
}
