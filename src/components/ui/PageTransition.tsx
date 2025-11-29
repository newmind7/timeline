import { useState, useEffect, ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  show: boolean;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'zoom';
  duration?: number;
  className?: string;
}

export default function PageTransition({
  children,
  show,
  type = 'fade',
  duration = 300,
  className = '',
}: PageTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // 延迟一帧以触发进入动画
      requestAnimationFrame(() => {
        setAnimationClass('enter');
      });
    } else {
      setAnimationClass('exit');
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const getAnimationStyles = () => {
    const baseStyle = {
      transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    };

    const animations: Record<string, { initial: object; enter: object; exit: object }> = {
      fade: {
        initial: { opacity: 0 },
        enter: { opacity: 1 },
        exit: { opacity: 0 },
      },
      'slide-up': {
        initial: { opacity: 0, transform: 'translateY(20px)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        exit: { opacity: 0, transform: 'translateY(20px)' },
      },
      'slide-down': {
        initial: { opacity: 0, transform: 'translateY(-20px)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        exit: { opacity: 0, transform: 'translateY(-20px)' },
      },
      'slide-left': {
        initial: { opacity: 0, transform: 'translateX(20px)' },
        enter: { opacity: 1, transform: 'translateX(0)' },
        exit: { opacity: 0, transform: 'translateX(20px)' },
      },
      'slide-right': {
        initial: { opacity: 0, transform: 'translateX(-20px)' },
        enter: { opacity: 1, transform: 'translateX(0)' },
        exit: { opacity: 0, transform: 'translateX(-20px)' },
      },
      scale: {
        initial: { opacity: 0, transform: 'scale(0.95)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(0.95)' },
      },
      zoom: {
        initial: { opacity: 0, transform: 'scale(0.8)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(1.1)' },
      },
    };

    const anim = animations[type];
    const state = animationClass === 'enter' ? 'enter' : animationClass === 'exit' ? 'exit' : 'initial';

    return { ...baseStyle, ...anim[state] };
  };

  return (
    <div className={className} style={getAnimationStyles()}>
      {children}
    </div>
  );
}

// 模态框过渡组件
interface ModalTransitionProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalTransition({ children, isOpen, onClose }: ModalTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* 内容 */}
      <div
        className={`relative transition-all duration-300 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// 列表项交错动画
interface StaggerListProps {
  children: ReactNode[];
  show: boolean;
  staggerDelay?: number;
}

export function StaggerList({ children, show, staggerDelay = 50 }: StaggerListProps) {
  return (
    <>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(10px)',
            transition: `all 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}
