/**
 * Morph targets for the particle entity (all share the same particle index).
 * Ported from the 3D prologue (ugsot-web/src/components/scene/shapes.ts); the
 * orbit ring keeps the thicker, denser band tuned for the hero.
 *
 *  pos0  – Orbit : hero particle ring (xy plane, tilted in the shader)
 *  pos1  – Globe : sparse dotted sphere behind Specializations
 *                  (vec4, w = 1 for the ~520 particles that draw a dot)
 *  pos2  – Robot : a particle robot silhouette for Pathways (vec4, w = body
 *                  part: 0 body · 1/2 legs · 3/4 arms, -1 = not drawn); `bot`
 *                  marks its red accent dots. The dotted GLB robot
 *                  (robotDots.ts) takes over from it as it settles.
 */

type V3 = [number, number, number];

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Approx. world-space width / height of each stage, for responsive fitting. */
export const STAGE_WIDTH = [7.6, 4.2, 2.6];
export const STAGE_HEIGHT = [4.5, 4.2, 4.2];
export const ORBIT_RADIUS = 2.0;

export function buildParticles(count: number) {
  const rand = mulberry32(2027);
  const gauss = () => {
    let u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const dir = (): V3 => {
    const x = gauss(), y = gauss(), z = gauss();
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l];
  };

  const pos0 = new Float32Array(count * 3);
  const orbit = new Float32Array(count);
  const pos1 = new Float32Array(count * 4);
  const pos2 = new Float32Array(count * 4);
  const bot = new Float32Array(count);
  const chaos = new Float32Array(count * 3);
  const random = new Float32Array(count * 4);

  /* ------------------------------------------------ robot (faces +z, feet at y ≈ -2) */
  const ROBOT_DOTS = Math.min(count, 2200);
  type Part = { w: number; part: number; accent?: boolean; at: () => V3 };
  const box = (c: V3, h: V3) => (): V3 => {
    const u: V3 = [rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1];
    const area = [h[1] * h[2], h[0] * h[2], h[0] * h[1]];
    const r = rand() * (area[0] + area[1] + area[2]);
    const ax = r < area[0] ? 0 : r < area[0] + area[1] ? 1 : 2;
    u[ax] = u[ax] < 0 ? -1 : 1;
    return [c[0] + u[0] * h[0], c[1] + u[1] * h[1], c[2] + u[2] * h[2]];
  };
  const ball = (c: V3, r: number) => (): V3 => {
    const d = dir();
    return [c[0] + d[0] * r, c[1] + d[1] * r, c[2] + d[2] * r];
  };
  const tube = (a: V3, b: V3, r: number) => (): V3 => {
    const t = rand();
    const th = rand() * Math.PI * 2;
    return [a[0] + (b[0] - a[0]) * t + Math.cos(th) * r, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + Math.sin(th) * r];
  };
  const disc = (c: V3, r: number) => (): V3 => {
    const rr = Math.sqrt(rand()) * r;
    const th = rand() * Math.PI * 2;
    return [c[0] + Math.cos(th) * rr, c[1] + Math.sin(th) * rr, c[2]];
  };
  const PARTS: Part[] = [
    { w: 17, part: 0, at: box([0, 1.45, 0], [0.62, 0.42, 0.46]) }, // head
    { w: 1.6, part: 0, accent: true, at: disc([-0.24, 1.48, 0.47], 0.11) }, // eyes
    { w: 1.6, part: 0, accent: true, at: disc([0.24, 1.48, 0.47], 0.11) },
    { w: 0.8, part: 0, at: tube([0, 1.87, 0], [0, 2.05, 0], 0.025) }, // antenna
    { w: 1.0, part: 0, accent: true, at: ball([0, 2.1, 0], 0.08) },
    { w: 2.0, part: 0, at: tube([0, 0.98, 0], [0, 1.03, 0], 0.16) }, // neck
    { w: 25, part: 0, at: box([0, 0.45, 0], [0.58, 0.55, 0.38]) }, // torso
    { w: 1.8, part: 0, accent: true, at: disc([0, 0.58, 0.39], 0.13) }, // chest light
    { w: 4, part: 0, at: box([0, -0.25, 0], [0.45, 0.14, 0.3]) }, // hips
    { w: 6.5, part: 3, at: tube([-0.78, 0.9, 0], [-0.86, -0.05, 0], 0.14) }, // arms
    { w: 2.2, part: 3, at: ball([-0.87, -0.14, 0], 0.17) },
    { w: 6.5, part: 4, at: tube([0.78, 0.9, 0], [0.86, -0.05, 0], 0.14) },
    { w: 2.2, part: 4, at: ball([0.87, -0.14, 0], 0.17) },
    { w: 8, part: 1, at: tube([-0.27, -0.4, 0], [-0.27, -1.76, 0], 0.16) }, // legs
    { w: 3.2, part: 1, at: box([-0.27, -1.88, 0.08], [0.2, 0.1, 0.28]) },
    { w: 8, part: 2, at: tube([0.27, -0.4, 0], [0.27, -1.76, 0], 0.16) },
    { w: 3.2, part: 2, at: box([0.27, -1.88, 0.08], [0.2, 0.1, 0.28]) },
  ];
  const PART_TOTAL = PARTS.reduce((a, p) => a + p.w, 0);
  const pickPart = () => {
    let r = rand() * PART_TOTAL;
    for (const p of PARTS) if ((r -= p.w) <= 0) return p;
    return PARTS[0];
  };

  /* ------------------------------------------------ globe lattice (Fibonacci sphere) */
  const GLOBE_DOTS = Math.min(count, 520);
  const GLOBE_R = 2.0;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const globePoint = (k: number): V3 => {
    const y = 1 - (k / (GLOBE_DOTS - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * k;
    return [Math.cos(t) * r * GLOBE_R, y * GLOBE_R, Math.sin(t) * r * GLOBE_R];
  };

  const R = ORBIT_RADIUS;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3, i4 = i * 4;

    /* ---------- 0 · orbit ring. type: 0 band · 1 arc · 3 outer spray · 4 dust */
    {
      const r = rand();
      let x = 0, y = 0, z = 0, type = 0;
      if (r < 0.5) {
        // a thick, dense band with a ragged edge
        const a = rand() * Math.PI * 2;
        const rr = R + gauss() * 0.055 + (rand() < 0.15 ? gauss() * 0.1 : 0);
        x = Math.cos(a) * rr; y = Math.sin(a) * rr; z = gauss() * 0.04;
      } else if (r < 0.555) {
        // green arc riding the inside of the band, top-right
        const a = 0.15 + rand() * 1.25;
        const rr = R - 0.08 + gauss() * 0.035;
        x = Math.cos(a) * rr; y = Math.sin(a) * rr; z = gauss() * 0.03;
        type = 1;
      } else if (r < 0.96) {
        // two diffuse sprays: upper-left and right / lower-right
        let a = 0;
        for (;;) {
          a = rand() * Math.PI * 2;
          const w =
            Math.pow(Math.max(Math.cos(a - 2.6), 0), 3.0) +
            Math.pow(Math.max(Math.cos(a + 0.28), 0), 2.2) * 1.15;
          if (rand() < w * 0.95 + 0.008) break;
        }
        const rr = R * (1.12 + Math.abs(gauss()) * 0.42);
        x = Math.cos(a) * rr; y = Math.sin(a) * rr; z = gauss() * 0.3;
        type = 3;
      } else {
        x = (rand() * 2 - 1) * 4.2; y = (rand() * 2 - 1) * 3.2; z = -0.5 - rand() * 2;
        type = 4;
      }
      pos0.set([x, y, z], i3);
      orbit[i] = type;
    }

    /* ---------- 1 · globe */
    {
      const p = globePoint(i % GLOBE_DOTS);
      pos1.set([p[0], p[1], p[2], i < GLOBE_DOTS ? 1 : 0], i4);
    }

    /* ---------- 2 · robot */
    if (i < ROBOT_DOTS) {
      const pt = pickPart();
      const v = pt.at();
      pos2.set([v[0], v[1], v[2], pt.part], i4);
      bot[i] = pt.accent ? 1 : 0;
    } else {
      pos2.set([0, 0.45, 0, -1], i4); // not drawn: parked on the torso
    }

    /* ---------- chaos (where each dot starts before the ring gathers) + random */
    const d = dir();
    const k = 5 + rand() * 10;
    chaos.set([d[0] * k, d[1] * k, d[2] * k], i3);
    random.set([rand(), rand(), rand(), rand()], i4);
  }

  return { count, pos0, orbit, pos1, pos2, bot, chaos, random };
}

/** Background dust drifting behind everything. */
export function buildDust(count: number) {
  const rand = mulberry32(7);
  const pos = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos.set([(rand() * 2 - 1) * 14, (rand() * 2 - 1) * 9, -3 - rand() * 12], i * 3);
    rnd[i] = rand();
  }
  return { pos, rnd };
}
