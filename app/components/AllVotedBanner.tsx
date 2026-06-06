import { X, BellRing, Eye } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  onReveal: () => void;
  onDismiss: () => void;
}

export function AllVotedBanner({ isDarkMode, onReveal, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-4xl p-10 text-center shadow-[0_28px_70px_rgba(15,23,42,0.35)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}>
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/15 text-blue-500">
            <BellRing size={32} />
          </div>
        </div>

        <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          All players have voted!
        </h3>
        <p className={`mt-2 text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Ready to reveal the results?
        </p>

        <button
          type="button"
          onClick={onReveal}
          className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700"
        >
          <Eye size={20} /> Reveal Votes
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <X size={14} /> Dismiss
        </button>
      </div>
    </div>
  );
}
