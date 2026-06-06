import { CardSet, CardValue, User } from '@/types';
import { getCardColor } from '../lib/scoring';

interface Props {
  myVote: User['vote'];
  canVote: boolean;
  isDarkMode: boolean;
  cardSet: CardSet;
  onVote: (val: CardValue) => void;
}

export function VotingCards({ myVote, canVote, isDarkMode, cardSet, onVote }: Props) {
  const total = cardSet.cards.length;
  const cols = total <= 6 ? total : Math.ceil(total / 2);
  // Target ~105px per card so portrait ratio is preserved at any column count
  const gridMaxWidth = cols * 105 + (cols - 1) * 12;

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="grid gap-3 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: `${gridMaxWidth}px` }}
      >
        {cardSet.cards.map((val) => (
          <button
            key={val}
            disabled={!canVote}
            onClick={() => onVote(val)}
            style={{ backgroundColor: getCardColor(val, cardSet.cards) }}
            className={`h-32 w-full rounded-2xl text-3xl sm:h-40 sm:rounded-3xl sm:text-4xl font-black text-white shadow-xl transition-all ${canVote ? 'cursor-pointer hover:-translate-y-3' : 'cursor-not-allowed opacity-45'} ${String(myVote) === String(val) ? 'scale-105 ring-10 ring-blue-400/40' : ''}`}
          >
            {val}
          </button>
        ))}
      </div>
      {canVote && (
        <p className={`mt-4 sm:mt-5 text-base sm:text-xl font-black tracking-[0.08em] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          Ready, steady, estimate!
        </p>
      )}
    </div>
  );
}
