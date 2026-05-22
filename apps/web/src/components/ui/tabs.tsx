import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || '');

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-[var(--nr-border)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              active === tab.id
                ? 'border-[var(--nr-green)] text-[var(--nr-green-dark)]'
                : 'border-transparent text-[var(--nr-muted)] hover:text-[var(--nr-ink)]'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}

interface SimpleTabs {
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabList({ tabs, value, onChange, className }: SimpleTabs) {
  return (
    <div className={cn('flex gap-1 border-b border-[var(--nr-border)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            value === tab.id
              ? 'border-[var(--nr-green)] text-[var(--nr-green-dark)]'
              : 'border-transparent text-[var(--nr-muted)] hover:text-[var(--nr-ink)]'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
