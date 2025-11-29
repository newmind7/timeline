import { useState, useRef, ButtonHTMLAttributes } from 'react';

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rippleColor?: string;
  children: React.ReactNode;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export default function RippleButton({
  variant = 'primary',
  size = 'md',
  rippleColor,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // 移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getRippleColor = () => {
    if (rippleColor) return rippleColor;
    switch (variant) {
      case 'primary':
      case 'success':
      case 'danger':
        return 'rgba(255, 255, 255, 0.4)';
      default:
        return 'rgba(0, 0, 0, 0.1)';
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-medium
        transition-all duration-200 ease-out
        transform active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {/* 涟漪效果 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            marginLeft: '-5px',
            marginTop: '-5px',
            backgroundColor: getRippleColor(),
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      
      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(40);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
