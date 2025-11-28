import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Timeline3DProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

// 单个事件节点
function EventNode({ 
  event, 
  position, 
  onClick,
  isHovered,
  onHover,
}: { 
  event: Event;
  position: [number, number, number];
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const status = getEventStatus(event.date, event.progress);
  
  const color = useMemo(() => {
    switch (status) {
      case 'completed': return '#3b82f6';
      case 'overdue': return '#ef4444';
      case 'today': return '#f59e0b';
      default: return '#22c55e';
    }
  }, [status]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      {/* 事件球体 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* 进度环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[0.35, 0.45, 32, 1, 0, (event.progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>

      {/* 标签 */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color={isHovered ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {event.title.length > 8 ? event.title.slice(0, 8) + '...' : event.title}
      </Text>

      {/* 日期 */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.12}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {new Date(event.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
      </Text>
    </group>
  );
}

// 时间轴线
function TimelinePath({ points }: { points: [number, number, number][] }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    );
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
  }, [points]);

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial attach="material" color="#475569" linewidth={2} />
    </line>
  );
}

// 背景粒子
function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#475569" transparent opacity={0.6} />
    </points>
  );
}

// 3D场景
function Scene({ events, onSelectEvent }: Timeline3DProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 按日期排序并计算位置
  const sortedEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((event, index) => ({
        event,
        position: [
          Math.sin(index * 0.8) * 3,
          0,
          index * 2 - (events.length * 2) / 2,
        ] as [number, number, number],
      }));
  }, [events]);

  const pathPoints = sortedEvents.map(e => e.position);

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 5, 10]} fov={60} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      {/* 背景粒子 */}
      <Particles />

      {/* 时间轴线 */}
      {pathPoints.length > 1 && <TimelinePath points={pathPoints} />}

      {/* 事件节点 */}
      {sortedEvents.map(({ event, position }) => (
        <EventNode
          key={event.id}
          event={event}
          position={position}
          onClick={() => onSelectEvent(event)}
          isHovered={hoveredId === event.id}
          onHover={(h) => setHoveredId(h ? event.id : null)}
        />
      ))}

      {/* 地面网格 */}
      <gridHelper args={[30, 30, '#1e293b', '#334155']} position={[0, -2, 0]} />
    </>
  );
}

export default function Timeline3D({ events, onSelectEvent }: Timeline3DProps) {
  const [key, setKey] = useState(0);

  const handleReset = () => setKey(k => k + 1);

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🌌 3D 时间轴
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
          >
            <RotateCcw className="w-4 h-4" /> 重置视角
          </button>
        </div>
      </div>

      {/* 提示 */}
      <div className="px-4 py-2 bg-slate-800/50 text-xs text-slate-400">
        💡 鼠标左键旋转 · 右键平移 · 滚轮缩放 · 点击节点查看详情
      </div>

      {/* 3D画布 */}
      <div className="h-[500px]">
        <Canvas key={key}>
          <Scene events={events} onSelectEvent={onSelectEvent} />
        </Canvas>
      </div>

      {/* 图例 */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/50 flex gap-6 text-sm text-slate-400">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> 即将到来</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> 今天</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> 已逾期</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> 已完成</span>
      </div>
    </div>
  );
}
