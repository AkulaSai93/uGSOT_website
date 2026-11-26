/**
 * Shaders for the scroll-story particle scene (hero ring → globe → robot),
 * ported from the 3D prologue (ugsot-web/src/components/scene/shaders.ts).
 *
 * Differences from the original, which drew additive glow under a bloom pass:
 * dots are crisp and laid "over" one another (premultiplied alpha), so the
 * ring keeps its indigo → teal instead of blowing out to white, and no
 * post-processing pass is needed. Colours arrive as raw sRGB.
 */

/* Ashima Arts 3D simplex noise (MIT) */
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
vec3 noise3(vec3 p){
  return vec3(snoise(p), snoise(p + vec3(31.41, 17.27, -9.13)), snoise(p + vec3(-21.7, 8.31, 44.9)));
}
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;   // 0 ring → 1 globe → 2 robot
uniform float uRoll;
uniform float uWalk;       // walk-cycle phase (radians), driven by distance travelled
uniform float uSwap;       // 0 → 1 as the dotted GLB robot fades in over the silhouette
uniform float uIntro;
uniform float uSize;
uniform float uOrbitSize;  // extra size for the ring's dots (scaled with the ring)
uniform float uPixelRatio;
uniform float uScale;
uniform float uMouseStrength;
uniform vec3  uMouse;
uniform vec3  uIndigo;
uniform vec3  uTeal;
uniform vec3  uArc;
uniform vec3  uViolet;
uniform vec3  uDust;
uniform vec3  uRed;        // globe flecks, robot accents, cursor warmth

attribute vec4  aPos1;
attribute vec4  aPos2;
attribute float aBot;
attribute vec3  aChaos;
attribute vec4  aRandom;
attribute float aOrbit;

varying vec3  vColor;
varying float vAlpha;
varying float vEdge;       // dot outer radius: crisp for the ring, a smaller core later
varying float vGlow;       // 0 ring → 1 globe / robot: how much soft halo a dot has

${noise}

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// per-particle staggered morph weight
float stageW(float p, float r){
  float t = clamp((p - r * 0.35) / 0.65, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main(){
  // ---- 0 · hero orbit (band spins; green arc anchored top-right; sprays drift)
  vec3 p0 = position;
  float isBand  = 1.0 - step(0.5, aOrbit);
  float isArc   = step(0.5, aOrbit) * (1.0 - step(1.5, aOrbit));
  float isSpray = step(2.5, aOrbit) * (1.0 - step(3.5, aOrbit));
  float isDust  = step(3.5, aOrbit);
  p0.xy = rot(uTime * (0.04 * isBand + 0.015 * isSpray)) * p0.xy;
  p0 += noise3(position * 0.8 + uTime * 0.1) * (0.015 * (isBand + isArc) + 0.14 * isSpray);
  float vy0 = p0.y;
  p0.yz = rot(0.1) * p0.yz;
  p0.xz = rot(-0.06) * p0.xz;

  // ---- 1 · dotted globe, slowly turning, slightly tilted
  vec3 p1 = aPos1.xyz;
  p1.xz = rot(uTime * 0.12) * p1.xz;
  p1.yz = rot(0.32) * p1.yz;
  p1.xy = rot(-uRoll) * p1.xy;
  float orb = clamp(uProgress - 1.0, 0.0, 1.0);
  float facing = smoothstep(-1.6, 1.4, p1.z);
  float upper = mix(smoothstep(-1.7, 0.5, p1.y), 1.0, orb);

  // ---- 2 · the robot silhouette, walking
  vec3 p2 = aPos2.xyz;
  float part = aPos2.w;
  float swing = sin(uWalk);
  float isLegL = 1.0 - step(0.5, abs(part - 1.0));
  float isLegR = 1.0 - step(0.5, abs(part - 2.0));
  float isArmL = 1.0 - step(0.5, abs(part - 3.0));
  float isArmR = 1.0 - step(0.5, abs(part - 4.0));
  float legA = 0.55 * swing * (isLegL - isLegR);
  float armA = -0.6 * swing * (isArmL - isArmR);
  vec2 hipYZ = rot(legA) * vec2(p2.y + 0.4, p2.z);
  vec2 shYZ = rot(armA) * vec2(p2.y - 0.9, p2.z);
  float isLeg = isLegL + isLegR;
  float isArm = isArmL + isArmR;
  p2.yz = mix(p2.yz, vec2(hipYZ.x - 0.4, hipYZ.y), isLeg);
  p2.yz = mix(p2.yz, vec2(shYZ.x + 0.9, shYZ.y), isArm);
  p2.y += isLeg * max(0.0, -legA) * 0.18;
  p2.y += (1.0 - isLeg) * abs(cos(uWalk)) * 0.07;
  p2.y += sin(uTime * 2.2) * 0.03 * (1.0 - isLeg);
  p2.xz = rot(-0.85) * p2.xz;
  p2.yz = rot(0.1) * p2.yz;

  float s1 = stageW(uProgress, aRandom.x);
  float s2 = stageW(uProgress - 1.0, aRandom.x);
  vec3 pos = mix(p0, p1, s1);
  pos = mix(pos, p2, s2);
  pos += noise3(pos * 0.65 + uTime * 0.25) * (sin(s1 * 3.14159) * 0.7 + sin(s2 * 3.14159) * 0.5);

  // intro: gather from chaos
  float it = clamp(uIntro * 1.5 - aRandom.x * 0.5, 0.0, 1.0);
  it = 1.0 - pow(1.0 - it, 3.0);
  vec3 chaos = aChaos + noise3(aChaos * 0.2 + uTime * 0.1) * 0.6;
  pos = mix(chaos, pos, it);

  // cursor field (world space)
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vec3 d = world.xyz - uMouse;
  float field = smoothstep(1.3 * uScale, 0.0, length(d)) * uMouseStrength;
  world.xyz += normalize(d + vec3(0.0001)) * field * 0.5 * uScale;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float orbitSize = ((isBand + isArc) * (0.8 + aRandom.y * 0.6)
                  + isSpray * (0.9 + aRandom.y * 1.2 + pow(aRandom.y, 5.0) * 2.0)
                  + isDust * 0.45) * uOrbitSize;
  // the globe and robot have no bloom pass to lift them, as in the prologue:
  // bigger dots with a soft halo (see the fragment) stand in for it
  float globeSize = (0.6 + aRandom.y * 0.45) * mix(1.0, 1.9, orb) * 2.2;
  float botSize = (0.75 + aRandom.y * 0.4) * (1.0 + aBot * 0.5) * 1.8;
  gl_PointSize = uSize * mix(mix(orbitSize, globeSize, s1), botSize, s2) * uPixelRatio / -mv.z;

  // ---- colour
  float down = clamp(-vy0 / 2.0 * 0.5 + 0.5, 0.0, 1.0);
  vec3 bandCol = mix(uIndigo, uTeal, smoothstep(0.4, 0.98, down));
  vec3 orbitCol = bandCol * isBand + uArc * isArc
                + uViolet * (0.55 + 0.45 * aRandom.z) * isSpray + uDust * isDust;
  vec3 globeCol = mix(mix(uIndigo, vec3(1.0), 0.6), uRed, step(mix(0.92, 0.55, orb), aRandom.z));
  vec3 botCol = mix(vec3(0.93, 0.94, 1.0), uRed, max(aBot, step(0.8, aRandom.z)));
  vec3 col = mix(mix(orbitCol, globeCol, s1), botCol, s2);
  col += uRed * field * 0.9;

  float flick = 0.7 + 0.3 * sin(uTime * 2.0 + aRandom.w * 6.2831);
  // ring: draw 40% of the band, only ~22% of the sprays (fewer, coarser dots)
  float keep = step(mix(0.6, 0.78, isSpray), fract(aRandom.w * 7.13));
  float orbitAlpha = keep * (isBand * 0.95 + isArc * 1.0 + isSpray * 0.85 + isDust * 0.5)
                   * mix(1.0, flick, 0.4);
  float globeAlpha = aPos1.w * (0.45 + 0.55 * facing) * upper * mix(1.0, flick, 0.5);
  float botFacing = smoothstep(-0.9, 0.7, p2.z);
  float botAlpha = step(-0.5, part) * (0.35 + 0.65 * botFacing) * (1.0 + aBot * 0.4)
                 * mix(1.0, flick, 0.25) * (1.0 - uSwap);
  float alpha = mix(mix(orbitAlpha, globeAlpha, s1), botAlpha, s2);
  alpha *= 0.35 + 0.65 * it;

  vColor = col;
  vAlpha = min(alpha, 1.0);
  float later = max(s1, s2);
  vEdge = mix(0.4, 0.24, later);
  vGlow = later;
}
`;

export const particleFragment = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;
varying float vEdge;
varying float vGlow;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(vEdge - 0.1, vEdge, d);
  float halo = exp(-d * d * mix(30.0, 14.0, vGlow)) * mix(0.12, 0.55, vGlow);
  float a = (core * 0.92 + halo) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);   // premultiplied
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRnd;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.1 + aRnd * 40.0) * 0.15;
  p.x += cos(uTime * 0.07 + aRnd * 30.0) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (8.0 + aRnd * 14.0) * uPixelRatio / -mv.z;
  vAlpha = (0.15 + 0.35 * aRnd) * (0.6 + 0.4 * sin(uTime * 0.8 + aRnd * 60.0));
}
`;

export const dustFragment = /* glsl */ `
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vec3(0.95, 0.92, 0.88) * a, a);
}
`;
