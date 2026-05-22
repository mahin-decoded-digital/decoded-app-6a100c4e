import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Avatar({ name, size = 'md', color = '#16a34a', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-primary-foreground shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
