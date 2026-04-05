import { Eye, ChevronRight } from 'lucide-react';

interface Props { onReveal: () => void; onNext: () => void; isDarkMode?: boolean; }

export const HostControls = ({ onReveal, onNext, isDarkMode = false }: Props) => (
  <div className="flex gap-3">
    <button onClick={onReveal} className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-lg transition ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
      <Eye size={18} /> Reveal
    </button>
    <button onClick={onNext} className="cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition">
      Next Ticket <ChevronRight size={18} />
    </button>
  </div>
);
