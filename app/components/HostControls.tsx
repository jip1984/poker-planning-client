import { BookOpen, Eye, Sliders, Zap } from 'lucide-react';

interface Props {
  onReveal: () => void;
  onHistory: () => void;
  onCardSet?: () => void;
  onToggleAutoReveal?: () => void;
  showCardSet?: boolean;
  autoReveal?: boolean;
  isDarkMode?: boolean;
}

export const HostControls = ({ onReveal, onHistory, onCardSet, onToggleAutoReveal, showCardSet = false, autoReveal = false, isDarkMode = false }: Props) => (
  <div className="flex flex-wrap gap-3">
    <button onClick={onReveal} className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-lg transition ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
      <Eye size={18} /> Reveal
    </button>
    <button onClick={onHistory} className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-lg transition ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
      <BookOpen size={18} /> History
    </button>
    {showCardSet && onCardSet && (
      <button onClick={onCardSet} className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-lg transition ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
        <Sliders size={18} /> Card Set
      </button>
    )}
    {onToggleAutoReveal && (
      <button
        onClick={onToggleAutoReveal}
        title={autoReveal ? 'Auto-reveal on — click to disable' : 'Auto-reveal off — click to enable'}
        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg transition ${autoReveal ? 'bg-blue-600 text-white hover:bg-blue-700' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
      >
        <Zap size={16} className={autoReveal ? 'fill-white' : ''} />
        Auto
      </button>
    )}
  </div>
);
