import { RoomState } from '@/types';
import { calculateAvg, calculateRoleAverage, getScoreColor } from '../lib/scoring';

interface Props {
  room: RoomState;
  isHost: boolean;
  isDarkMode: boolean;
}

export function ResultsSummary({ room, isHost, isDarkMode }: Props) {
  if (!isHost) {
    const avg = calculateAvg(room);
    return (
      <div className="mt-8 flex min-h-[16rem] flex-col items-center justify-start">
        <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Overall Average
        </p>
        <div
          style={{ backgroundColor: getScoreColor(avg) }}
          className="flex h-44 w-32 items-center justify-center rounded-[2rem] text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
        >
          {avg}
        </div>
      </div>
    );
  }

  const summaryItems = [
    { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
    { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
    { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
    { label: 'Overall Average', value: calculateAvg(room) },
  ];

  return (
    <div className="mt-12 w-full max-w-4xl">
      <div className={`rounded-[1.9rem] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}>
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Revealed Summary
          </p>
          <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Averages by role plus the overall estimate
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-[1.45rem] px-4 py-4 ${isDarkMode ? 'border border-slate-800 bg-slate-950/80' : 'border border-slate-200 bg-slate-50/90'}`}
            >
              <p className={`min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {item.label}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div
                  style={{ backgroundColor: getScoreColor(item.value) }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                >
                  {item.value}
                </div>
                <p className={`text-sm font-medium leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.value === '-' ? 'No votes yet' : 'Based on revealed votes'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
