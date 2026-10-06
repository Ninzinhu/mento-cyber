"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useRef, useState } from "react";
import type { Group } from "three";

function SignalObject({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!reducedMotion && group.current) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0.35, -0.35, 0]}>
      <mesh>
        <octahedronGeometry args={[0.88, 1]} />
        <meshStandardMaterial color="#f4f4f5" wireframe roughness={0.7} />
      </mesh>
      {[-0.92, 0, 0.92].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, index * 0.55, 0]}>
          <torusGeometry args={[1.35 - index * 0.16, 0.012, 8, 72]} />
          <meshBasicMaterial color={index === 1 ? "#f4f4f5" : "#71717a"} />
        </mesh>
      ))}
      <mesh position={[0, -1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.14, 72]} />
        <meshBasicMaterial color="#52525b" />
      </mesh>
    </group>
  );
}

export function SignalField() {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas dpr={[1, dpr]} camera={{ position: [0, 0, 5], fov: 38 }}>
      <PerformanceMonitor onDecline={() => setDpr(1)}>
        <ambientLight intensity={1.5} />
        <pointLight position={[2, 2, 3]} intensity={10} color="#ffffff" />
        <SignalObject reducedMotion={reducedMotion} />
      </PerformanceMonitor>
    </Canvas>
  );
}
