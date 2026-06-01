import { Check, Clock3 } from 'lucide-react';
import { User } from '@/types';
import { COLORS } from '../lib/constants';

interface Props {
  user: User;
  isCurrentUser: boolean;
  isObserverSection: boolean;
  revealed: boolean;
  isDarkMode: boolean;
  onOpenProfile: () => void;
}

export function ParticipantCard({ user, isCurrentUser, isObserverSection, revealed, isDarkMode, onOpenProfile }: Props) {
  const hasVoted = user.vote !== null;
  const showVoteValue = revealed && user.vote !== null;

  return (
    <button
      type="button"
      onClick={() => isCurrentUser && onOpenProfile()}
      className={`flex w-full items-center gap-3 rounded-[1.55rem] px-4 py-3.5 text-left shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/70'} ${isCurrentUser ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-black uppercase text-blue-600">
        {user.name.slice(0, 1) || '?'}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <p title={user.name} className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {user.name}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-end">
        {showVoteValue ? (
          <div
            style={{ backgroundColor: COLORS[String(user.vote)] }}
            className="flex h-14 w-11 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
          >
            {user.vote}
          </div>
        ) : hasVoted ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600">
            <Check size={14} strokeWidth={3} />
            Voted
          </div>
        ) : isObserverSection ? (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
            Optional
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-600">
            <Clock3 size={14} strokeWidth={2.5} />
            Waiting
          </div>
        )}
      </div>
    </button>
  );
}
