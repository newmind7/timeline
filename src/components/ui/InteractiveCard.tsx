import { useState, useRef, ReactNode, MouseEvent } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'lift' | 'glow' | 'tilt' | 'border' | 'none';
  clickEffect?: 'shrink' | 'ripple' | 'bounce' | 'none';
  glowColor?: string;
}

export default function InteractiveCard({
  children,
  className = '',
  onClick,
  hoverEffect = 'lift',
  clickEffect = 'shrink',
  glowColor = 'rgba(59, 130, 246, 0.3)',
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (hoverEffect !== 'tilt' || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 10;
    const tiltY = (centerX - x) / 10;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (clickEffect === 'ripple' && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipple({ x, y, id: Date.now() });
      setTimeout(() => setRipple(null), 600);
    }
    onClick?.();
  };

  const getHoverStyles = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:-translate-y-1 hover:shadow-lg';
      case 'glow':
        return '';
      case 'border':
        return 'hover:border-blue-400 dark:hover:border-blue-500';
      case 'tilt':
        return '';
      default:
        return '';
    }
  };

  const getClickStyles = () => {
    if (isPressed) {
      switch (clickEffect) {
        case 'shrink':
          return 'scale-[0.98]';
        case 'bounce':
          return 'scale-[1.02]';
        default:
          return '';
      }
    }
    return '';
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`
        relative overflow-hidden
        transition-all duration-200 ease-out
        cursor-pointer
        ${getHoverStyles()}
        ${getClickStyles()}
        ${className}
      `}
      style={{
        transform: hoverEffect === 'tilt' 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` 
          : undefined,
        boxShadow: hoverEffect === 'glow' && tilt.x !== 0 
          ? `0 0 30px ${glowColor}` 
          : undefined,
      }}
    >
      {children}

      {/* 涟漪效果 */}
      {ripple && clickEffect === 'ripple' && (
        <span
          className="absolute rounded-full bg-black/10 dark:bg-white/10 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            animation: 'card-ripple 0.6s ease-out forwards',
          }}
        />
      )}

      <style>{`
        @keyframes card-ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(50);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// 悬停工具提示
interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
      <div
        className={`
          absolute z-50 px-2 py-1 text-xs text-white bg-slate-800 rounded whitespace-nowrap
          transition-all duration-200
          ${positionStyles[position]}
          ${show ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        style={{
          transform: show 
            ? `translate(${position === 'left' || position === 'right' ? '0' : '-50%'}, ${position === 'top' || position === 'bottom' ? '0' : '-50%'})` 
            : `translate(${position === 'left' || position === 'right' ? '0' : '-50%'}, ${position === 'top' ? '5px' : position === 'bottom' ? '-5px' : '-50%'})`,
        }}
      >
        {content}
      </div>
    </div>
  );
}

// 加载骨架屏
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({ width, height, rounded = false, className = '' }: SkeletonProps) {
  return (
    <div
      className={`
        bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200
        dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
        animate-pulse
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}
