// 2026-11-13: water, rain, snow, firefly and sunrise scenes (CHOSEUN: "물멍 퀄리티가 별로에요. 테마가 더 있어도 좋겠어요").
// One sky function is drawn on the dome and sampled again by the water shader, so the
// moon, clouds and ridgelines are truly reflected (with wave normals) instead of faked
// with a translucent strip. Everything is still drawn from code: no textures or models.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { prefersReducedMotion } from '@/hooks/useMotion';
import { Drift, dot } from './scene-kit';

/** Scene palette (three.js colours, not CSS theme colours). */
const P = {
  lanternPaper: '#ffb487',
  lanternGlow: '#ffb766',
  pad: '#1c3a2a',
  reed: '#04090a',
  stone: '#74777c',
  stoneShade: '#25272d',
  stoneLight: '#ffc878',
  warm: '#ffb35c',
  snow: '#dfe7f5',
  pine: '#10261b',
  trunk: '#1a1410',
  firefly: '#d8ff7a',
  rain: '#b9c9d9',
  white: '#ffffff',
} as const;

type Look = {
  zenith: string; horizon: string; moon: string; ridge: string; deep: string; light: string;
  /** Direction to the moon (or sun). */
  moonDir: [number, number, number];
  moonSize: number; moonGlow: number; stars: number; cloud: number; ridgeHeight: number; milky: number;
  chop: number; ripple: number; rippleCell: number; rippleRate: number;
};

const LOOKS = {
  water: { zenith: '#040a1e', horizon: '#1d3552', moon: '#fff0cf', ridge: '#060d16', deep: '#03111b', light: '#ffb060', moonDir: [0.07, 0.25, -1], moonSize: 0.05, moonGlow: 1, stars: 0.9, cloud: 0.15, ridgeHeight: 1, milky: 0.25, chop: 0.2, ripple: 0.1, rippleCell: 2.6, rippleRate: 0.12 },
  rain: { zenith: '#10171f', horizon: '#33424f', moon: '#c9d6e2', ridge: '#0b1218', deep: '#07141a', light: '#ffb060', moonDir: [-0.2, 0.5, -1], moonSize: 0, moonGlow: 0.35, stars: 0, cloud: 1, ridgeHeight: 0.9, milky: 0, chop: 0.26, ripple: 0.8, rippleCell: 0.75, rippleRate: 0.85 },
  snow: { zenith: '#0a1124', horizon: '#34405f', moon: '#e6ecff', ridge: '#3a4763', deep: '#0a1124', light: '#ffb060', moonDir: [0.22, 0.36, -1], moonSize: 0.04, moonGlow: 0.7, stars: 0.35, cloud: 0.6, ridgeHeight: 1.1, milky: 0, chop: 0, ripple: 0, rippleCell: 1, rippleRate: 0 },
  fireflies: { zenith: '#02050e', horizon: '#14303b', moon: '#cfe0ff', ridge: '#020506', deep: '#020a0d', light: '#c8ff6a', moonDir: [0.6, 0.5, -1], moonSize: 0, moonGlow: 0.12, stars: 1, cloud: 0, ridgeHeight: 1.5, milky: 1, chop: 0.1, ripple: 0.05, rippleCell: 2.2, rippleRate: 0.1 },
  dawn: { zenith: '#26366c', horizon: '#de8559', moon: '#ffdca8', ridge: '#1a1626', deep: '#0c1a30', light: '#ffb060', moonDir: [0.04, 0.075, -1], moonSize: 0.045, moonGlow: 2.2, stars: 0.12, cloud: 0.45, ridgeHeight: 0.28, milky: 0, chop: 0.32, ripple: 0, rippleCell: 1, rippleRate: 0 },
} as const satisfies Record<string, Look>;

const MAX_LIGHTS = 8;

const SKY_GLSL = /* glsl */ `
uniform float uTime;
uniform vec3 uMoonDir, uMoonCol, uZenith, uHorizon, uRidgeCol;
uniform float uMoonSize, uMoonGlow, uStars, uCloud, uRidge, uMilky;
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*noise(p); p=p*2.03+17.; a*=.5; } return s; }
vec3 sky(vec3 d){
  float y=max(d.y,0.);
  float az=atan(d.x,-d.z);
  float m=max(dot(d,uMoonDir),0.);
  vec3 col=mix(uHorizon,uZenith,pow(y,.5));
  col+=uMoonCol*uMoonGlow*(.05*pow(m,8.)+.16*pow(m,64.)+.3*pow(m,900.));
  if(uStars>0.){
    vec2 uv=d.xz/(y+.35)*26.; vec2 id=floor(uv); vec2 f=fract(uv)-.5;
    float h=hash(id);
    vec2 o=(vec2(hash(id+7.1),hash(id+13.7))-.5)*.7;
    float s=smoothstep(.09,0.,length(f-o))*step(.84,h);
    s*=.55+.45*sin(uTime*(1.+h*3.)+h*40.);
    float band=exp(-pow((d.x*.55+d.y*.85-.5)*3.,2.));
    col+=(vec3(.85,.9,1.)*s*uStars+vec3(.42,.48,.75)*uMilky*band*(.2+.8*fbm(uv*.3))*.3)*smoothstep(.02,.22,y);
  }
  float disc=0.;
  if(uMoonSize>0.){
    disc=smoothstep(cos(uMoonSize),cos(uMoonSize*.88),dot(d,uMoonDir));
    vec3 mx=normalize(cross(uMoonDir,vec3(0.,1.,0.))); vec3 my=cross(mx,uMoonDir);
    float maria=fbm(vec2(dot(d,mx),dot(d,my))/uMoonSize*1.6+3.7);
    col=mix(col,uMoonCol*(.75+.4*maria)*1.7,disc);
  }
  float c=fbm(vec2(az*2.4+uTime*.006,y*7.-uTime*.002));
  float cl=smoothstep(.5-uCloud*.3,.9-uCloud*.25,c)*(1.-smoothstep(.05,.75,y));
  col=mix(col,mix(uHorizon*1.25,uMoonCol,.12+.5*pow(m,10.)*min(uMoonGlow,1.)),cl*(.3+.5*uCloud)*(1.-disc*.85));
  if(uRidge>0.){
    float r1=uRidge*(.04+.2*fbm(vec2(az*2.2+4.,1.3)));
    float r2=uRidge*(.015+.12*fbm(vec2(az*3.1+9.,7.7)));
    col=mix(col,mix(uRidgeCol,uHorizon,.5),smoothstep(r1+.004,r1-.004,d.y));
    col=mix(col,mix(uRidgeCol,uHorizon,.08+.3*smoothstep(r2,0.,d.y)),smoothstep(r2+.003,r2-.003,d.y));
  }
  return col;
}`;

const WORLD_VERT = /* glsl */ `
varying vec3 vWorld;
void main(){ vec4 w=modelMatrix*vec4(position,1.); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;

const DOME_FRAG = /* glsl */ `
varying vec3 vWorld;
${SKY_GLSL}
void main(){
  gl_FragColor=vec4(sky(normalize(vWorld-cameraPosition)),1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const WATER_FRAG = /* glsl */ `
varying vec3 vWorld;
uniform vec3 uDeep, uLightCol;
uniform float uChop, uRipple, uRippleCell, uRippleRate;
uniform vec4 uLights[${MAX_LIGHTS}];
${SKY_GLSL}
vec2 waveGrad(vec2 p,float t){
  vec2 g=vec2(0.);
  g+=vec2(.8,.6)*cos(dot(p,vec2(.8,.6))*.9+t*.8)*.5;
  g+=vec2(-.5,.86)*cos(dot(p,vec2(-.5,.86))*1.7+t*1.1)*.35;
  g+=vec2(.2,-.98)*cos(dot(p,vec2(.2,-.98))*3.1+t*1.6)*.25;
  g+=vec2(-.9,-.4)*cos(dot(p,vec2(-.9,-.4))*5.3+t*2.1)*.18;
  float e=.05; vec2 q=p*2.3+t*.22; float n0=noise(q);
  g+=vec2(noise(q+vec2(e,0.))-n0,noise(q+vec2(0.,e))-n0)/e*.3;
  return g;
}
vec2 ripples(vec2 p,float t){
  vec2 q=p/uRippleCell; vec2 id=floor(q); vec2 g=vec2(0.);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 c=id+vec2(float(i),float(j)); float h=hash(c);
    if(h>uRipple) continue;
    vec2 o=vec2(hash(c+3.1),hash(c+5.7));
    float ph=fract(t*uRippleRate*(.6+.8*hash(c+9.3))+h*7.);
    vec2 dl=q-(c+o); float d=length(dl); float r=ph*1.15;
    float w=sin((d-r)*24.)*smoothstep(.2,0.,abs(d-r))*(1.-ph)*(1.-ph);
    g+=dl/(d+1e-3)*w;
  }
  return g;
}
void main(){
  vec3 toP=vWorld-cameraPosition; float dist=length(toP); vec3 V=toP/dist;
  float att=1./(1.+dist*.05);
  vec2 g=waveGrad(vWorld.xz,uTime)*uChop*att;
  if(uRipple>0.) g+=ripples(vWorld.xz,uTime)*.45*att;
  vec3 N=normalize(vec3(-g.x,1.,-g.y));
  vec3 R=reflect(V,N); R.y=abs(R.y);
  float F=.03+.97*pow(1.-max(dot(-V,N),0.),5.);
  vec3 col=mix(uDeep,sky(R),clamp(F+.16,0.,1.));
  col+=uMoonCol*min(uMoonGlow,1.2)*pow(max(dot(R,uMoonDir),0.),900.)*2.5;
  for(int i=0;i<${MAX_LIGHTS};i++){
    vec4 L=uLights[i]; if(L.w<=0.) continue;
    vec3 tl=L.xyz-vWorld; float dl=length(tl);
    col+=uLightCol*L.w*(pow(max(dot(R,tl/dl),0.),170.)*1.1/(1.+dl*.12)+.09/(1.+dl*dl*5.));
  }
  col=mix(col,uHorizon,smoothstep(45.,170.,dist)*.92);
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

type Uniforms = Record<string, THREE.IUniform>;

function useLook(look: Look): Uniforms {
  return useMemo(() => ({
    uTime: { value: 0 },
    uMoonDir: { value: new THREE.Vector3(...look.moonDir).normalize() },
    uMoonCol: { value: new THREE.Color(look.moon) },
    uZenith: { value: new THREE.Color(look.zenith) },
    uHorizon: { value: new THREE.Color(look.horizon) },
    uRidgeCol: { value: new THREE.Color(look.ridge) },
    uMoonSize: { value: look.moonSize }, uMoonGlow: { value: look.moonGlow }, uStars: { value: look.stars },
    uCloud: { value: look.cloud }, uRidge: { value: look.ridgeHeight }, uMilky: { value: look.milky },
    uDeep: { value: new THREE.Color(look.deep) }, uLightCol: { value: new THREE.Color(look.light) },
    uChop: { value: look.chop }, uRipple: { value: look.ripple }, uRippleCell: { value: look.rippleCell }, uRippleRate: { value: look.rippleRate },
    uLights: { value: Array.from({ length: MAX_LIGHTS }, () => new THREE.Vector4()) },
  }), [look]);
}

function useDispose(...items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), items);
}

/** Sky dome, plus the clock for every shader in the scene. */
function SkyDome({ u }: { u: Uniforms }) {
  const still = useMemo(() => prefersReducedMotion(), []);
  const geom = useMemo(() => new THREE.SphereGeometry(180, 48, 24), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms: u, vertexShader: WORLD_VERT, fragmentShader: DOME_FRAG, side: THREE.BackSide, depthWrite: false, depthTest: false }), [u]);
  useDispose(geom, mat);
  useFrame(({ clock }) => { if (!still) u.uTime.value = clock.elapsedTime; });
  return <mesh geometry={geom} material={mat} renderOrder={-10} frustumCulled={false} />;
}

function WaterPlane({ u }: { u: Uniforms }) {
  const geom = useMemo(() => { const g = new THREE.PlaneGeometry(420, 420); g.rotateX(-Math.PI / 2); return g; }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms: u, vertexShader: WORLD_VERT, fragmentShader: WATER_FRAG }), [u]);
  useDispose(geom, mat);
  return <mesh geometry={geom} material={mat} />;
}

/** Half the visible width at a distance in front of the camera, so framing props sit at the screen edge on phones and desktops alike. */
function useHalfWidth() {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  return (distance: number) => distance * Math.tan(THREE.MathUtils.degToRad(25)) * aspect;
}

// Deterministic pseudo-random, so the layout is the same on every visit and render.
function seeded(seed: number) {
  let s = seed;
  return (a = 0, b = 1) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
}

function lotusGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (const [n, tilt, r, s] of [[9, 1.05, 0.05, 1], [6, 0.55, 0.025, 0.85]] as const) {
    for (let k = 0; k < n; k++) {
      const g = new THREE.SphereGeometry(1, 8, 6);
      g.scale(0.05 * s, 0.11 * s, 0.016);
      g.translate(0, 0.1 * s, 0);
      g.rotateX(tilt);
      g.translate(0, 0.02, r);
      g.rotateY((k / n) * Math.PI * 2 + (n === 6 ? 0.3 : 0));
      parts.push(g);
    }
  }
  return mergeGeometries(parts)!;
}

/** Paper lotus lanterns drifting on the water; each one also feeds a light into the water shader. */
function LotusLanterns({ u, count = 7, camZ }: { u: Uniforms; count?: number; camZ: number }) {
  const ref = useRef<THREE.Group>(null);
  const geom = useMemo(lotusGeometry, []);
  useDispose(geom);
  const half = useHalfWidth();
  const items = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: Math.min(count, MAX_LIGHTS) }, (_, i) => ({ fx: r(-0.8, 0.8), d: 3.2 + i * 2.1 + r(0, 1), p: r(0, 6), s: r(0.9, 1.25) }));
  }, [count]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lights = u.uLights.value as THREE.Vector4[];
    ref.current?.children.forEach((c, i) => {
      const it = items[i];
      const x = it.fx * half(it.d) + Math.sin(t * 0.07 + it.p) * 0.5;
      const y = 0.02 + Math.sin(t * 0.8 + it.p) * 0.012;
      const z = camZ - it.d + Math.sin(t * 0.05 + it.p * 2) * 0.6;
      c.position.set(x, y, z);
      c.rotation.set(Math.sin(t * 0.7 + it.p) * 0.04, t * 0.05 + it.p, Math.cos(t * 0.6 + it.p) * 0.04);
      lights[i].set(x, 0.16, z, 0.75 + 0.12 * Math.sin(t * 3.1 + it.p * 5));
    });
  });
  return <group ref={ref}>{items.map((it, i) => <group key={i} scale={it.s}>
    <mesh geometry={geom}><meshBasicMaterial color={P.lanternPaper} /></mesh>
    <sprite position={[0, 0.1, 0]} scale={0.75}><spriteMaterial map={dot()} color={P.lanternGlow} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
  </group>)}</group>;
}

function LilyPads({ camZ, count = 26 }: { camZ: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const half = useHalfWidth();
  const geom = useMemo(() => { const g = new THREE.CircleGeometry(1, 22, 0, 5.75); g.rotateX(-Math.PI / 2); return g; }, []);
  useDispose(geom);
  useEffect(() => {
    const r = seeded(5), o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const d = r(1.6, 9), side = r() < 0.5 ? -1 : 1;
      // Clustered toward the edges so the middle of the pond stays open for the reflections.
      o.position.set(side * half(d) * r(0.35, 1.05), 0.012, camZ - d);
      o.rotation.set(0, r(0, 6.28), 0);
      o.scale.setScalar(r(0.14, 0.36));
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [camZ, count, half]);
  return <instancedMesh ref={ref} args={[geom, undefined, count]} frustumCulled={false}><meshStandardMaterial color={P.pad} roughness={0.7} /></instancedMesh>;
}

/** Dark reed silhouettes at both screen edges, swaying a little. */
function Reeds({ camZ, count = 70, tall = 1 }: { camZ: number; count?: number; tall?: number }) {
  const group = useRef<THREE.Group>(null);
  const ref = useRef<THREE.InstancedMesh>(null);
  const half = useHalfWidth();
  const geom = useMemo(() => { const g = new THREE.ConeGeometry(0.022, 1, 4); g.translate(0, 0.5, 0); return g; }, []);
  useDispose(geom);
  useEffect(() => {
    const r = seeded(23), o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const d = r(2, 4.4), side = i % 2 ? -1 : 1;
      o.position.set(side * half(d) * r(0.93, 1.5), -0.02, camZ - d);
      o.rotation.set(r(-0.12, 0.12), r(0, 6.28), -side * r(0.02, 0.28));
      o.scale.set(r(0.8, 1.6), r(0.9, 2.3) * tall, 1);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [camZ, count, half, tall]);
  useFrame(({ clock }) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.012; });
  return <group ref={group}><instancedMesh ref={ref} args={[geom, undefined, count]} frustumCulled={false}><meshBasicMaterial color={P.reed} fog={false} /></instancedMesh></group>;
}

type MoteKind = 'firefly' | 'snow' | 'rain';
const MOTE_VERT = /* glsl */ `
attribute float aSeed; attribute float aEnd;
uniform float uTime, uSize, uPx, uKind; uniform vec3 uBox;
varying float vA;
void main(){
  vec3 p=position; float s=aSeed; vA=1.;
  if(uKind<.5){
    p+=vec3(sin(uTime*.31+s*40.),sin(uTime*.23+s*17.)*.35,cos(uTime*.27+s*29.))*.7;
    vA=smoothstep(-.1,1.,sin(uTime*(.7+s*.9)+s*50.));
  } else if(uKind<1.5){
    p.y=mod(p.y-uTime*(.45+s*.5),uBox.y);
    p.x+=sin(uTime*.6+s*30.)*.35;
    vA=.55+.45*s;
  } else {
    p.y=mod(p.y-uTime*(11.+s*5.),uBox.y)+aEnd*(.35+s*.3);
    p.x+=aEnd*.035;
    vA=.12+.2*s;
  }
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=uSize*uPx*(.6+.8*s)/max(.5,-mv.z);
}`;
const MOTE_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uKind; varying float vA;
void main(){
  float a=vA;
  if(uKind<1.5){ float d=length(gl_PointCoord-.5); a*=1.-smoothstep(uKind<.5?0.:.2,.5,d); }
  gl_FragColor=vec4(uColor,a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Fireflies, snowflakes or rain streaks: one GPU-animated particle field. */
function Motes({ kind, count, box, center, color, size }: { kind: MoteKind; count: number; box: [number, number, number]; center: [number, number, number]; color: string; size: number }) {
  const still = useMemo(() => prefersReducedMotion(), []);
  const { gl, size: view } = useThree();
  const [bx, by, bz] = box;
  const geom = useMemo(() => {
    const r = seeded(kind.length * 97 + count), per = kind === 'rain' ? 2 : 1;
    const pos = new Float32Array(count * per * 3), seed = new Float32Array(count * per), end = new Float32Array(count * per);
    for (let i = 0; i < count; i++) {
      const x = r(-bx / 2, bx / 2), y = r(0, by), z = r(-bz / 2, bz / 2), s = r();
      for (let k = 0; k < per; k++) { const j = i * per + k; pos.set([x, y, z], j * 3); seed[j] = s; end[j] = k; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    return g;
  }, [kind, count, bx, by, bz]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: size }, uPx: { value: 1 }, uKind: { value: kind === 'firefly' ? 0 : kind === 'snow' ? 1 : 2 }, uBox: { value: new THREE.Vector3(bx, by, bz) }, uColor: { value: new THREE.Color(color) } },
    vertexShader: MOTE_VERT, fragmentShader: MOTE_FRAG, transparent: true, depthWrite: false,
    blending: kind === 'firefly' ? THREE.AdditiveBlending : THREE.NormalBlending,
  }), [kind, size, color, bx, by, bz]);
  useDispose(geom, mat);
  useFrame(({ clock }) => {
    if (!still) mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPx.value = gl.getPixelRatio() * view.height * 0.5;
  });
  return kind === 'rain'
    ? <lineSegments geometry={geom} material={mat} position={center} frustumCulled={false} />
    : <points geometry={geom} material={mat} position={center} frustumCulled={false} />;
}

/** 석등: a stone lantern with a lit chamber. */
function StoneLantern({ position, snow = false, scale = 1 }: { position: [number, number, number]; snow?: boolean; scale?: number }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => { if (light.current) light.current.intensity = 5 + Math.sin(clock.elapsedTime * 5.3) * 0.35 + Math.sin(clock.elapsedTime * 8.9) * 0.2; });
  // A little self-light keeps the stone readable at night; the lamp sits just in front so it warms the faces we see.
  const stone = <meshStandardMaterial color={P.stone} emissive={P.stoneShade} roughness={0.95} />;
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.3, 0.36, 0.14, 6]} />{stone}</mesh>
    <mesh position={[0, 0.43, 0]}><cylinderGeometry args={[0.095, 0.125, 0.6, 8]} />{stone}</mesh>
    <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.3, 0.17, 0.1, 6]} />{stone}</mesh>
    <mesh position={[0, 0.97, 0]}><boxGeometry args={[0.27, 0.28, 0.27]} /><meshBasicMaterial color={P.stoneLight} /></mesh>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <mesh key={i} position={[x * 0.14, 0.97, z * 0.14]}><boxGeometry args={[0.05, 0.28, 0.05]} />{stone}</mesh>)}
    <mesh position={[0, 1.22, 0]} rotation-y={Math.PI / 6}><coneGeometry args={[0.44, 0.24, 6]} />{stone}</mesh>
    <mesh position={[0, 1.39, 0]}><sphereGeometry args={[0.07, 10, 8]} />{stone}</mesh>
    {snow && <mesh position={[0, 1.27, 0]} rotation-y={Math.PI / 6}><coneGeometry args={[0.45, 0.2, 6]} /><meshStandardMaterial color={P.snow} roughness={1} /></mesh>}
    <sprite position={[0, 0.97, 0]} scale={1.5}><spriteMaterial map={dot()} color={P.warm} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    <pointLight ref={light} position={[0, 0.97, 0.5]} color={P.warm} distance={11} decay={1.5} />
  </group>;
}

/** Stone lanterns stand further back on a narrow phone frame so they do not fill it. */
function useLanternDistance() {
  return useThree((s) => (s.size.width / Math.max(1, s.size.height) < 0.8 ? 8.5 : 5.2));
}

/* ---------- 물멍: lotus lanterns on a moonlit pond ---------- */

const CAM_Z = 1;

function PondBase({ look, ambient = 0.35, children }: { look: Look; ambient?: number; children?: (u: Uniforms) => React.ReactNode }) {
  const u = useLook(look);
  return <>
    <fog attach="fog" args={[look.horizon, 30, 150]} />
    <ambientLight intensity={ambient} color={look.horizon} />
    <directionalLight position={[look.moonDir[0] * 20, look.moonDir[1] * 20 + 4, look.moonDir[2] * 20]} intensity={0.9 * Math.min(1, look.moonGlow + 0.2)} color={look.moon} />
    <SkyDome u={u} />
    <WaterPlane u={u} />
    {children?.(u)}
  </>;
}

export function MoonPond() {
  return <PondBase look={LOOKS.water}>{(u) => <>
    <LotusLanterns u={u} camZ={CAM_Z} />
    <LilyPads camZ={CAM_Z} />
    <Reeds camZ={CAM_Z} />
    <Motes kind="firefly" count={36} box={[14, 1.6, 14]} center={[0, 0.3, -7]} color={P.firefly} size={0.09} />
    <Drift target={[0, 1.0, -6]} radius={7} height={1.5} speed={0.03} sway={0.07} />
  </>}</PondBase>;
}

/* ---------- 비멍: rain rings on the pond, one stone lantern on the bank ---------- */

function BankLantern({ u, side }: { u: Uniforms; side: 1 | -1 }) {
  const half = useHalfWidth();
  const distance = useLanternDistance();
  const x = side * half(distance) * 0.62, z = CAM_Z - distance;
  useEffect(() => { (u.uLights.value as THREE.Vector4[])[0].set(x, 1.0, z, 1.5); }, [u, x, z]);
  return <>
    <mesh position={[x, 0.02, z]} scale={[1, 0.22, 0.8]}><dodecahedronGeometry args={[0.75, 1]} /><meshStandardMaterial color={P.stone} roughness={1} /></mesh>
    <StoneLantern position={[x, 0.1, z]} />
  </>;
}

export function RainPond() {
  return <PondBase look={LOOKS.rain} ambient={1.6}>{(u) => <>
    <BankLantern u={u} side={1} />
    <LilyPads camZ={CAM_Z} count={34} />
    <Reeds camZ={CAM_Z} count={50} />
    <Motes kind="rain" count={1500} box={[16, 9, 16]} center={[0, 0, -5]} color={P.rain} size={1} />
    <Drift target={[0, 0.9, -6]} radius={7} height={1.6} speed={0.025} sway={0.07} />
  </>}</PondBase>;
}

/* ---------- 반딧불: fireflies over a dark summer pond ---------- */

function HeroFireflies({ u }: { u: Uniforms }) {
  const ref = useRef<THREE.Group>(null);
  const half = useHalfWidth();
  const items = useMemo(() => { const r = seeded(41); return Array.from({ length: 6 }, (_, i) => ({ d: 3 + i * 1.3, fx: r(-0.7, 0.7), p: r(0, 6), h: r(0.35, 1.1) })); }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lights = u.uLights.value as THREE.Vector4[];
    ref.current?.children.forEach((c, i) => {
      const it = items[i];
      const x = it.fx * half(it.d) + Math.sin(t * 0.21 + it.p) * 0.9;
      const y = it.h + Math.sin(t * 0.33 + it.p * 2) * 0.25;
      const z = CAM_Z - it.d + Math.cos(t * 0.17 + it.p) * 0.8;
      const blink = THREE.MathUtils.smoothstep(Math.sin(t * (0.8 + i * 0.13) + it.p * 9), -0.2, 0.9);
      c.position.set(x, y, z);
      c.scale.setScalar(0.14 + 0.45 * blink);
      lights[i].set(x, y, z, 0.9 * blink);
    });
  });
  return <group ref={ref}>{items.map((_, i) => <sprite key={i}><spriteMaterial map={dot()} color={P.firefly} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>)}</group>;
}

export function FireflyPond() {
  return <PondBase look={LOOKS.fireflies}>{(u) => <>
    <HeroFireflies u={u} />
    <Motes kind="firefly" count={340} box={[18, 2.8, 20]} center={[0, 0.15, -9]} color={P.firefly} size={0.17} />
    <Reeds camZ={CAM_Z} count={100} tall={1.2} />
    <LilyPads camZ={CAM_Z} count={18} />
    <Drift target={[0, 1.1, -6]} radius={7} height={1.4} speed={0.03} sway={0.07} />
  </>}</PondBase>;
}

/* ---------- 해돋이: the sun coming up over a calm sea ---------- */

export function DawnSea() {
  return <PondBase look={LOOKS.dawn}>{() => <Drift target={[0, 1.6, -8]} radius={8} height={1.9} speed={0.02} sway={0.05} />}</PondBase>;
}

/* ---------- 눈멍: snow falling on pines and a stone lantern ---------- */

const snowHeight = (x: number, z: number) => Math.sin(x * 0.35) * 0.18 + Math.sin(z * 0.27 + 1.3) * 0.22 + Math.sin((x + z) * 0.9) * 0.04;

function pineGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const paint = (g: THREE.BufferGeometry, hex: string) => {
    const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    return g;
  };
  const trunk = new THREE.CylinderGeometry(0.07, 0.1, 0.9, 6); trunk.translate(0, 0.45, 0);
  parts.push(paint(trunk, P.trunk));
  for (let i = 0; i < 4; i++) {
    const r = 0.85 - i * 0.19, y = 0.95 + i * 0.52;
    const tier = new THREE.ConeGeometry(r, 0.95, 9); tier.translate(0, y, 0);
    parts.push(paint(tier, P.pine));
    // Snow sits on the upper part of each tier and leaves the dark skirt showing.
    const cap = new THREE.ConeGeometry(r * 0.74, 0.62, 9); cap.translate(0, y + 0.2, 0);
    parts.push(paint(cap, P.snow));
  }
  return mergeGeometries(parts)!;
}

function Pines({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(pineGeometry, []);
  useDispose(geom);
  const half = useHalfWidth();
  useEffect(() => {
    const r = seeded(77), o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const d = r(9, 38), side = i % 2 ? -1 : 1;
      // Leave a clear lane down the middle toward the moon.
      const x = side * (half(d) * r(0.3, 1.2) + 1.2), z = CAM_Z + 1 - d;
      o.position.set(x, snowHeight(x, z) - 0.1, z);
      o.rotation.set(0, r(0, 6.28), 0);
      const s = r(0.8, 1.5); o.scale.set(s, s * r(1, 1.35), s);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count, half]);
  return <instancedMesh ref={ref} args={[geom, undefined, count]} frustumCulled={false}><meshStandardMaterial vertexColors roughness={1} /></instancedMesh>;
}

function SnowGround() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(160, 160, 120, 120);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = snowHeight(p[i], p[i + 2]);
    g.computeVertexNormals();
    return g;
  }, []);
  useDispose(geom);
  return <mesh geometry={geom}><meshStandardMaterial color={P.snow} roughness={0.95} /></mesh>;
}

export function SnowNight() {
  const look: Look = LOOKS.snow;
  const u = useLook(look);
  const half = useHalfWidth();
  const ld = useLanternDistance();
  const lx = -half(ld) * 0.5, lz = CAM_Z + 1 - ld;
  return <>
    <fog attach="fog" args={[look.horizon, 12, 70]} />
    <hemisphereLight args={[look.horizon, look.zenith, 1.1]} />
    <directionalLight position={[6, 9, -20]} intensity={0.7} color={look.moon} />
    <SkyDome u={u} />
    <SnowGround />
    <Pines />
    <StoneLantern position={[lx, snowHeight(lx, lz) - 0.03, lz]} snow scale={1.15} />
    <Motes kind="snow" count={1400} box={[22, 9, 24]} center={[0, 0, -8]} color={P.white} size={0.07} />
    <Drift target={[0, 1.5, -6]} radius={8} height={1.7} speed={0.025} sway={0.07} />
  </>;
}
