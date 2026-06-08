import { TbHandFinger } from 'react-icons/tb';

interface Props {
  isDarkMode: boolean;
  onDismiss: () => void;
}

export function PokedBanner({ isDarkMode, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm" onClick={onDismiss}>
      <div
        className={`w-full max-w-md rounded-4xl p-10 text-center shadow-[0_28px_70px_rgba(15,23,42,0.35)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/15 text-blue-500">
            <TbHandFinger size={32} />
          </div>
        </div>

        <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          You've been poked!
        </h3>
        <p className={`mt-2 text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Time to cast your vote.
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 w-full cursor-pointer rounded-2xl bg-blue-600 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
