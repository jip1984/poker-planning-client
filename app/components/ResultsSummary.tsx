import { CardSet, RoomState } from '@/types';
import { calculateAvg, calculateRoleAverage, getScoreColor } from '../lib/scoring';

interface Props {
  room: RoomState;
  cardSet: CardSet;
  isHost: boolean;
  isDarkMode: boolean;
}

export function ResultsSummary({ room, cardSet, isHost, isDarkMode }: Props) {
  if (!isHost) {
    const avg = calculateAvg(room);
    const roleItems = [
      { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
      { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
      { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
    ];
    return (
      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            Overall Average
          </p>
          <div
            style={{ backgroundColor: getScoreColor(avg, cardSet) }}
            className="flex h-32 w-24 sm:h-44 sm:w-32 items-center justify-center rounded-4xl text-4xl sm:text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
          >
            {avg}
          </div>
        </div>

        <div className="grid w-full max-w-lg gap-3 grid-cols-3">
          {roleItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-[1.45rem] px-4 py-4 ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}
            >
              <p className="min-h-8 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div
                  style={{ backgroundColor: getScoreColor(item.value, cardSet) }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow"
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

  const overall = calculateAvg(room);
  const roleItems = [
    { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
    { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
    { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
  ];

  return (
    <div className="mt-8 flex flex-col items-center gap-6">
      <div className="flex flex-col items-center">
        <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Overall Average
        </p>
        <div
          style={{ backgroundColor: getScoreColor(overall, cardSet) }}
          className="flex h-32 w-24 sm:h-44 sm:w-32 items-center justify-center rounded-4xl text-4xl sm:text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
        >
          {overall}
        </div>
      </div>

      <div className="grid w-full max-w-lg gap-3 grid-cols-3">
        {roleItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.45rem] px-4 py-4 ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}
          >
            <p className="min-h-8 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div
                style={{ backgroundColor: getScoreColor(item.value, cardSet) }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow"
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
