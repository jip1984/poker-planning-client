import { X } from 'lucide-react';
import { CardSet, RoomState } from '@/types';
import { formatHistoryTimestamp, getCardColor } from '../lib/scoring';

interface Props {
  room: RoomState;
  cardSet: CardSet;
  isDarkMode: boolean;
  onClose: () => void;
}

export function HistoryModal({ room, cardSet, isDarkMode, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-4xl p-8 shadow-[0_28px_70px_rgba(15,23,42,0.28)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Session History</h3>
            <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Completed tickets stay here until this room session ends.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`cursor-pointer flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            aria-label="Close history"
          >
            <X size={18} />
          </button>
        </div>

        {room.history?.length ? (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {room.history.map((entry, index) => (
              <div
                key={`${entry.completedAt}-${entry.ticket}-${index}`}
                className={`flex items-center gap-4 rounded-3xl px-5 py-4 ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/80'}`}
              >
                <div className="min-w-0 flex-1">
                  <p title={entry.ticket} className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {entry.ticket}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {formatHistoryTimestamp(entry)}
                  </p>
                </div>
                <div
                  style={{ backgroundColor: getCardColor(entry.score, cardSet.cards) }}
                  className="flex h-16 w-14 shrink-0 items-center justify-center rounded-[1.35rem] text-2xl font-black text-white shadow-lg"
                >
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-[1.75rem] px-5 py-10 text-center text-sm font-semibold ${isDarkMode ? 'border border-slate-800 bg-slate-950 text-slate-500' : 'border border-slate-200 bg-slate-50/70 text-slate-500'}`}>
            No completed tickets yet. Reveal and move to the next ticket to start building session history.
          </div>
        )}
      </div>
    </div>
  );
}
