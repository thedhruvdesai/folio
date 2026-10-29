"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "./ThemeProvider";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vAlpha;

  float wave(vec2 p, float t) {
    return sin(p.x * 0.55 + t * 0.6) * 0.34
         + cos(p.y * 0.75 + t * 0.42) * 0.28
         + sin((p.x + p.y) * 0.32 - t * 0.3) * 0.26;
  }

  void main() {
    vec3 p = position;
    float h = wave(p.xy, uTime);
    vec4 c0 = projectionMatrix * modelViewMatrix * vec4(p.xy, h, 1.0);
    vec2 d = c0.xy / c0.w - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float infl = smoothstep(0.5, 0.0, dist);
    p.z = h + infl * (0.75 + 0.35 * sin(dist * 22.0 - uTime * 4.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.7 + aRand * 0.9 + infl * 1.6) / -mv.z;
    float depthFade = smoothstep(-26.0, -7.0, mv.z);
    vAlpha = (0.25 + 0.75 * aRand) * depthFade * (0.55 + infl * 0.9);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

function Field({ color, opacity, reduce }: { color: string; opacity: number; reduce: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0, -0.2));
  const target = useRef(new THREE.Vector2(0, -0.2));
  const { size, gl } = useThree();

  const geometry = useMemo(() => {
    const cols = 170;
    const rows = 100;
    const w = 34;
    const h = 22;
    const pos = new Float32Array(cols * rows * 3);
    const rand = new Float32Array(cols * rows);
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pos[i * 3] = (x / (cols - 1) - 0.5) * w + (Math.random() - 0.5) * 0.06;
        pos[i * 3 + 1] = (y / (rows - 1) - 0.5) * h + (Math.random() - 0.5) * 0.06;
        pos[i * 3 + 2] = 0;
        rand[i] = Math.random();
        i++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, -0.2) },
      uAspect: { value: 1 },
      uSize: { value: 34 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    uniforms.uColor.value.set(color);
    uniforms.uOpacity.value = opacity;
  }, [color, opacity, uniforms]);

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    if (!reduce) u.uTime.value += Math.min(delta, 0.05);
    mouse.current.lerp(target.current, 0.06);
    u.uMouse.value.copy(mouse.current);
    u.uAspect.value = size.width / size.height;
    u.uPixelRatio.value = gl.getPixelRatio();
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.current.x * 0.6, 0.03);
    state.camera.lookAt(0, 2, 0);
  });

  return (
    <points geometry={geometry} rotation={[-1.12, 0, 0]} position={[0, -1.4, 0]}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroCanvas() {
  const { theme } = useTheme();
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const dark = theme === "dark";

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.5, 7.5], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Field color={dark ? "#d4a857" : "#1a1714"} opacity={dark ? 1 : 0.8} reduce={reduce} />
      </Canvas>
    </div>
  );
}
