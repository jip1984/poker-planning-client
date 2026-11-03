import { CardSet, RoomState } from '@/types';
import { calculateAvg, calculateRoleAverage, cardStyle, getScoreColor } from '../lib/scoring';
import { resultsDelay } from '../lib/motion';
import { FlipIn, RiseIn } from './FlipIn';

const ROLE_STAGGER_S = 0.06;

interface Props {
  room: RoomState;
  cardSet: CardSet;
  isDarkMode: boolean;
}

/** Revealed results: the same layout for host and voters. */
export function ResultsSummary({ room, cardSet, isDarkMode }: Props) {
  const overall = calculateAvg(room);
  const roleItems = [
    { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
    { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
    // No observer row: observers don't vote.
  ];
  // Wait for the sidebar cards to flip first.
  const delay = resultsDelay(room.users.filter((u) => u.vote !== null).length);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className={`text-sm font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Overall Average
        </p>
        <FlipIn delay={delay}>
          <div
            style={cardStyle(getScoreColor(overall, cardSet))}
            className="flex h-44 w-32 items-center justify-center rounded-4xl text-5xl font-black shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
          >
            {overall}
          </div>
        </FlipIn>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {roleItems.map((item, i) => (
          <RiseIn
            key={item.label}
            delay={delay + 0.15 + i * ROLE_STAGGER_S}
            className={`flex flex-1 items-center gap-4 rounded-[1.45rem] px-5 py-3 ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}
          >
            <div
              style={cardStyle(getScoreColor(item.value, cardSet))}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-lg"
            >
              {item.value}
            </div>
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.label}
            </p>
          </RiseIn>
        ))}
      </div>
    </div>
  );
}
