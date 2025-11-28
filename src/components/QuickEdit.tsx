import { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Calendar, Tag } from 'lucide-react';
import { Event, EVENT_CATEGORIES, PRIORITY_LEVELS } from '../types';

interface QuickEditProps {
  event: Event;
  onUpdate: (updates: Partial<Event>) => Promise<void>;
  field: 'title' | 'date' | 'category' | 'priority' | 'progress';
  children: React.ReactNode;
}

export default function QuickEdit({ event, onUpdate, field, children }: QuickEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string | number>('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      switch (field) {
        case 'title':
          setValue(event.title);
          break;
        case 'date':
          setValue(event.date.split('T')[0]);
          break;
        case 'category':
          setValue(event.category || 'other');
          break;
        case 'priority':
          setValue(event.priority || 'p2');
          break;
        case 'progress':
          setValue(event.progress);
          break;
      }
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, event, field]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let updates: Partial<Event> = {};
      
      switch (field) {
        case 'title':
          if (typeof value === 'string' && value.trim()) {
            updates.title = value.trim();
          }
          break;
        case 'date':
          if (typeof value === 'string') {
            updates.date = value;
          }
          break;
        case 'category':
          updates.category = value as any;
          break;
        case 'priority':
          updates.priority = value as any;
          break;
        case 'progress':
          updates.progress = Number(value);
          break;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(updates);
      }
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const renderEditor = () => {
    switch (field) {
      case 'title':
        return (
          <input
            ref={inputRef as any}
            type="text"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        );
      
      case 'date':
        return (
          <input
            ref={inputRef as any}
            type="date"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        );
      
      case 'category':
        return (
          <select
            ref={inputRef as any}
            value={value as string}
            onChange={(e) => { setValue(e.target.value); }}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          >
            {EVENT_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        );
      
      case 'priority':
        return (
          <select
            ref={inputRef as any}
            value={value as string}
            onChange={(e) => { setValue(e.target.value); }}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          >
            {PRIORITY_LEVELS.map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        );
      
      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef as any}
              type="range"
              min={0}
              max={100}
              step={5}
              value={value as number}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 w-10">
              {value}%
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {renderEditor()}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="group flex items-center gap-1 cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      {children}
      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
