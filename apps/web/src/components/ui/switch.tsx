import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-0.5',
          'focus:outline-none focus:ring-2 focus:ring-[var(--nr-green)] focus:ring-offset-2',
          checked ? 'bg-[var(--nr-green)]' : 'bg-[var(--nr-border)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform shadow-sm',
            checked ? 'translate-x-4' : 'translate-x-1'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-[var(--nr-ink)]">{label}</p>}
          {description && <p className="text-sm text-[var(--nr-muted)]">{description}</p>}
        </div>
      )}
    </label>
  );
}
