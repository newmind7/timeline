import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Event } from '../types';
import { getEventStatus } from '../utils/dateUtils';
import { RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface Timeline3DContentProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onError?: () => void;
}

// 事件球体
function EventSphere({ 
  position, 
  color, 
  progress,
  title,
  onClick,
  isHovered,
  onHover,
}: { 
  position: [number, number, number];
  color: string;
  progress: number;
  title: string;
  onClick: () => void;
  isHovered: boolean;
  onHover: (h: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = isHovered ? 1.3 : 1;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        scale={scale}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
        />
      </mesh>
      {/* 进度环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[0.35, 0.45, 32, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// 连接线
function ConnectionLine({ points }: { points: THREE.Vector3[] }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial attach="material" color="#475569" />
    </line>
  );
}

// 场景内容
function SceneContent({ events, onSelectEvent }: { events: Event[]; onSelectEvent: (e: Event) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((event, index) => {
        const status = getEventStatus(event.date, event.progress);
        const color = status === 'completed' ? '#3b82f6' : 
                      status === 'overdue' ? '#ef4444' : 
                      status === 'today' ? '#f59e0b' : '#22c55e';
        return {
          event,
          color,
          position: [
            Math.sin(index * 0.8) * 3,
            0,
            index * 2 - (events.length * 2) / 2,
          ] as [number, number, number],
        };
      });
  }, [events]);

  const linePoints = sortedEvents.map(e => new THREE.Vector3(...e.position));

  return (
    <>
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={30} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      {linePoints.length > 1 && <ConnectionLine points={linePoints} />}

      {sortedEvents.map(({ event, color, position }) => (
        <EventSphere
          key={event.id}
          position={position}
          color={color}
          progress={event.progress}
          title={event.title}
          onClick={() => onSelectEvent(event)}
          isHovered={hoveredId === event.id}
          onHover={(h) => setHoveredId(h ? event.id : null)}
        />
      ))}

      <gridHelper args={[30, 30, '#1e293b', '#334155']} position={[0, -2, 0]} />
    </>
  );
}

export default function Timeline3DContent({ events, onSelectEvent, onError }: Timeline3DContentProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // 检查WebGL支持
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        onError?.();
      }
    } catch (e) {
      onError?.();
    }
  }, [onError]);

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🌌 3D 时间轴
        </h2>
        <button
          onClick={() => setKey(k => k + 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
        >
          <RotateCcw className="w-4 h-4" /> 重置
        </button>
      </div>

      <div className="px-4 py-2 bg-slate-800/50 text-xs text-slate-400">
        💡 鼠标左键旋转 · 右键平移 · 滚轮缩放 · 点击球体查看事件
      </div>

      <div className="h-[500px]">
        <Canvas key={key} camera={{ position: [8, 5, 10], fov: 60 }}>
          <SceneContent events={events} onSelectEvent={onSelectEvent} />
        </Canvas>
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-800/50 flex gap-6 text-sm text-slate-400">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> 即将到来</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> 今天</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> 已逾期</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> 已完成</span>
      </div>
    </div>
  );
}
