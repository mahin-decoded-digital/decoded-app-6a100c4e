import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--nr-ink)] mb-1.5">{label}</label>
      )}
      <select
        className={cn(
          'w-full h-10 rounded-[var(--nr-radius)] border border-input bg-background px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[var(--nr-green)] focus:border-transparent',
          'transition-colors',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
