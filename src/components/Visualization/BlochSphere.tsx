// ============================================================
// QuantumLearn AI — Bloch Sphere 3D Visualization
// React Three Fiber based, per-qubit Bloch sphere
// ============================================================

import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Compass } from 'lucide-react';
import type { BlochVector } from '../../core/types';

interface BlochSphereProps {
  blochVectors: BlochVector[];
}

export function BlochSpherePanel({ blochVectors }: BlochSphereProps) {
  const [selectedQubit, setSelectedQubit] = useState<number>(0);

  if (blochVectors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs p-4 text-center">
        <Compass size={24} className="text-slate-600 mb-2" />
        <p>Run simulation to render 3D Bloch sphere</p>
      </div>
    );
  }

  // Ensure selectedQubit is valid
  const activeIndex = selectedQubit < blochVectors.length ? selectedQubit : 0;
  const activeVec = blochVectors[activeIndex];

  return (
    <div className="h-full flex flex-col p-2.5 bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 transition-colors">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/10 light:border-slate-200 shrink-0">
        <div className="flex items-center gap-1.5">
          <Compass size={14} className="text-[#4FD1D9] light:text-[#0D9488]" />
          <span className="text-xs font-bold font-heading">Bloch Sphere</span>
        </div>

        {/* Qubit selector pills */}
        {blochVectors.length > 1 && (
          <div className="flex items-center gap-1 bg-[#0A0E1A] light:bg-slate-100 p-0.5 rounded-lg border border-white/10 light:border-slate-200">
            {blochVectors.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedQubit(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                  activeIndex === idx
                    ? 'bg-[#4FD1D9] text-[#0A0E1A] shadow-xs'
                    : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black'
                }`}
              >
                q{idx}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main 3D Sphere Canvas */}
      <div className="w-full h-[190px] relative rounded-xl overflow-hidden border border-[#4FD1D9]/20 light:border-slate-200 bg-[#0A0E1A] light:bg-slate-50 shrink-0">
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [2.2, 1.8, 2.2], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} intensity={0.8} />
            <BlochSphere3D vector={activeVec} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.6}
            />
          </Canvas>
        </div>

        {/* Floating coordinates badge */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-400 light:text-slate-600 bg-black/60 light:bg-white/80 backdrop-blur-xs px-2 py-1 rounded-md border border-white/10 light:border-slate-200 pointer-events-none z-10">
          <span>q{activeIndex} Vector</span>
          <span className="text-[#4FD1D9] light:text-[#0D9488] font-bold">
            [{activeVec.x.toFixed(2)}, {activeVec.y.toFixed(2)}, {activeVec.z.toFixed(2)}]
          </span>
        </div>
      </div>
    </div>
  );
}

function BlochSphere3D({ vector }: { vector: BlochVector }) {
  // Axis lines — render in --signal-cyan
  const axes = useMemo(() => [
    { from: [-1.3, 0, 0] as [number, number, number], to: [1.3, 0, 0] as [number, number, number], label: 'X', color: '#4FD1D9' },
    { from: [0, -1.3, 0] as [number, number, number], to: [0, 1.3, 0] as [number, number, number], label: 'Z', color: '#4FD1D9' },
    { from: [0, 0, -1.3] as [number, number, number], to: [0, 0, 1.3] as [number, number, number], label: 'Y', color: '#4FD1D9' },
  ], []);

  return (
    <group>
      {/* Wireframe sphere — in --signal-cyan */}
      <mesh>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#4FD1D9"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Semi-transparent surface — in --panel */}
      <mesh>
        <sphereGeometry args={[0.99, 32, 32]} />
        <meshPhongMaterial
          color="#12172A"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Axes in --signal-cyan */}
      {axes.map((axis) => (
        <group key={axis.label}>
          <Line
            points={[axis.from, axis.to]}
            color={axis.color}
            lineWidth={1}
            transparent
            opacity={0.35}
          />
          <Html center position={axis.to}>
            <span style={{ color: axis.color, fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none' }}>
              {axis.label}
            </span>
          </Html>
        </group>
      ))}

      {/* |0⟩ and |1⟩ labels */}
      <Html center position={[0, 1.2, 0]}>
        <span style={{ color: '#4FD1D9', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none', textShadow: '0 0 8px rgba(79,209,217,0.5)' }}>
          |0⟩
        </span>
      </Html>
      <Html center position={[0, -1.2, 0]}>
        <span style={{ color: '#D9A441', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none', textShadow: '0 0 8px rgba(217,164,65,0.5)' }}>
          |1⟩
        </span>
      </Html>

      {/* State vector arrow in --cryostat-gold (#D9A441) */}
      <group position={[0, 0, 0]}>
        <Line
          points={[[0, 0, 0], [vector.x, vector.z, vector.y]]}
          color="#D9A441"
          lineWidth={3.5}
        />
        {/* Arrow tip in --cryostat-gold */}
        <mesh position={[vector.x, vector.z, vector.y]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial color="#D9A441" />
        </mesh>
      </group>

      {/* Equator circle in --signal-cyan */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1, 64]} />
        <meshBasicMaterial
          color="#4FD1D9"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
