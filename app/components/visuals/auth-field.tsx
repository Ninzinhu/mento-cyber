"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, Vector3, type Group } from "three";

function ParticleAssembly({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const positions = useMemo(
    () =>
      Float32Array.from({ length: 210 }, (_, index) => {
        const axis = index % 3;
        const seed = Math.sin(index * 92.7) * 43758.5453;
        return (
          (seed - Math.floor(seed)) * (axis === 1 ? 5.2 : 4.4) -
          (axis === 1 ? 2.6 : 2.2)
        );
      }),
    [],
  );
  const spline = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-2.2, -1.1, -0.5),
        new Vector3(-1.1, 1.35, 0.4),
        new Vector3(0.25, -0.35, 0.85),
        new Vector3(1.2, 1.1, -0.25),
        new Vector3(2.1, -0.8, 0.15),
      ]),
    [],
  );

  useFrame((_, delta) => {
    if (!reducedMotion && group.current) {
      group.current.rotation.y += delta * 0.06;
      group.current.rotation.x = Math.sin(performance.now() * 0.00015) * 0.12;
    }
  });

  return (
    <group ref={group} rotation={[0.2, -0.45, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#f4f4f5"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.72}
        />
      </points>
      <mesh rotation={[0.7, 0.2, 0]}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshBasicMaterial color="#d4d4d8" wireframe transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[1.1, -0.3, 0.5]}>
        <torusGeometry args={[1.62, 0.012, 8, 80]} />
        <meshBasicMaterial color="#a1a1aa" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[0.15, 0.6, 0.8]}>
        <torusGeometry args={[2.06, 0.008, 8, 80]} />
        <meshBasicMaterial color="#52525b" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <tubeGeometry args={[spline, 80, 0.014, 8, false]} />
        <meshBasicMaterial color="#d4d4d8" transparent opacity={0.76} />
      </mesh>
    </group>
  );
}

export function AuthField() {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 38 }} dpr={[1, dpr]}>
      <PerformanceMonitor onDecline={() => setDpr(1)}>
        <ambientLight intensity={1.5} />
        <pointLight position={[2, 2, 3]} intensity={12} color="#ffffff" />
        <ParticleAssembly reducedMotion={reducedMotion} />
      </PerformanceMonitor>
    </Canvas>
  );
}
