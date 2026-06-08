'use client';
import { useState } from 'react';
import { BookOpen, Eye, Sliders, Zap } from 'lucide-react';
import { TbHandFinger } from 'react-icons/tb';

interface Props {
  onReveal: () => void;
  onHistory: () => void;
  onCardSet?: () => void;
  onToggleAutoReveal?: () => void;
  onPokeAll?: () => void;
  showCardSet?: boolean;
  autoReveal?: boolean;
  hasIdleVoters?: boolean;
  isDarkMode?: boolean;
}

export const HostControls = ({ onReveal, onHistory, onCardSet, onToggleAutoReveal, onPokeAll, showCardSet = false, autoReveal = false, hasIdleVoters = false, isDarkMode = false }: Props) => {
  const [pokeCooldown, setPokeCooldown] = useState(false);

  const handlePokeAll = () => {
    if (!onPokeAll || pokeCooldown) return;
    onPokeAll();
    setPokeCooldown(true);
    setTimeout(() => setPokeCooldown(false), 10000);
  };

  return (
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
      {onPokeAll && hasIdleVoters && (
        <button
          onClick={handlePokeAll}
          disabled={pokeCooldown}
          title={pokeCooldown ? 'Poke sent — wait a moment' : 'Poke all idle voters'}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          <TbHandFinger size={16} /> Poke
        </button>
      )}
    </div>
  );
};
