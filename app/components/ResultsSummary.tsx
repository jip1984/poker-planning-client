import { CardSet, RoomState } from '@/types';
import { calculateAvg, calculateRoleAverage, getScoreColor } from '../lib/scoring';

interface Props {
  room: RoomState;
  cardSet: CardSet;
  isHost: boolean;
  isDarkMode: boolean;
}

function RevealedResults({ room, cardSet, isDarkMode }: { room: RoomState; cardSet: CardSet; isDarkMode: boolean }) {
  const overall = calculateAvg(room);
  const roleItems = [
    { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
    { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
    { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Overall Average
        </p>
        <div
          style={{ backgroundColor: getScoreColor(overall, cardSet) }}
          className="flex h-44 w-32 sm:h-56 sm:w-40 items-center justify-center rounded-4xl text-5xl sm:text-6xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
        >
          {overall}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-xl gap-4 grid-cols-3">
        {roleItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.45rem] px-5 py-5 ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}
          >
            <p className="min-h-8 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div
                style={{ backgroundColor: getScoreColor(item.value, cardSet) }}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg"
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HostResults({ room, cardSet, isDarkMode }: { room: RoomState; cardSet: CardSet; isDarkMode: boolean }) {
  const overall = calculateAvg(room);
  const roleItems = [
    { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
    { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
    { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
  ];

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Overall Average
        </p>
        <div
          style={{ backgroundColor: getScoreColor(overall, cardSet) }}
          className="flex h-44 w-32 items-center justify-center rounded-4xl text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
        >
          {overall}
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {roleItems.map((item) => (
          <div
            key={item.label}
            className={`flex flex-1 items-center gap-4 rounded-[1.45rem] px-5 py-3 ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}
          >
            <div
              style={{ backgroundColor: getScoreColor(item.value, cardSet) }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
            >
              {item.value}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsSummary({ room, cardSet, isHost, isDarkMode }: Props) {
  if (isHost) return <HostResults room={room} cardSet={cardSet} isDarkMode={isDarkMode} />;
  return <RevealedResults room={room} cardSet={cardSet} isDarkMode={isDarkMode} />;
}
