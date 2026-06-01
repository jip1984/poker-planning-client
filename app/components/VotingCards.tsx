import { User } from '@/types';
import { CARDS, COLORS } from '../lib/constants';

interface Props {
  myVote: User['vote'];
  canVote: boolean;
  isDarkMode: boolean;
  onVote: (val: number | '?') => void;
}

export function VotingCards({ myVote, canVote, isDarkMode, onVote }: Props) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4">
        {CARDS.map((val) => (
          <button
            key={val}
            disabled={!canVote}
            onClick={() => onVote(val)}
            style={{ backgroundColor: COLORS[val] }}
            className={`h-36 w-24 rounded-3xl text-4xl font-black text-white shadow-xl transition-all ${canVote ? 'cursor-pointer hover:-translate-y-4' : 'cursor-not-allowed opacity-45'} ${myVote === val ? 'scale-105 ring-[10px] ring-blue-400/40' : ''}`}
          >
            {val}
          </button>
        ))}
      </div>
      {canVote && (
        <p className={`mt-8 text-2xl font-black tracking-[0.08em] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          Ready, steady, estimate!
        </p>
      )}
    </div>
  );
}
