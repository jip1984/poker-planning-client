import { ChevronDown } from 'lucide-react';
import { User } from '@/types';

interface Props {
  host: User;
  isCurrentUser: boolean;
  isDarkMode: boolean;
  onOpenProfile: () => void;
}

export function HostCard({ host, isCurrentUser, isDarkMode, onOpenProfile }: Props) {
  return (
    <button
      type="button"
      onClick={() => isCurrentUser && onOpenProfile()}
      className={`w-full rounded-3xl px-4 py-3 text-left shadow-sm sm:w-auto sm:min-w-55 ${isDarkMode ? 'border border-slate-800 bg-slate-900' : 'border border-slate-200 bg-white'} ${isCurrentUser ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black uppercase text-blue-600">
          {host.name.slice(0, 1) || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <p title={host.name} className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {host.name}
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-500">
            {isCurrentUser ? 'You are host' : 'Host'}
          </p>
        </div>

        {isCurrentUser && (
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
            Managing <ChevronDown size={11} strokeWidth={3} />
          </div>
        )}
        {!isCurrentUser && (
          <div className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
            Managing
          </div>
        )}
      </div>
    </button>
  );
}
