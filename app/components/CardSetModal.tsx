'use client';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CardSet, CardValue } from '@/types';
import { CARD_PRESETS } from '../lib/constants';

const MAX_CUSTOM_CARDS = 10;

interface Props {
  currentCardSet: CardSet;
  isDarkMode: boolean;
  onApply: (cardSet: CardSet) => void;
  onClose: () => void;
}

function isValidCardValue(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true; // blank slots are fine until Apply
  if (trimmed === '?') return true;
  return /^\d+(\.\d+)?$/.test(trimmed);
}

function toCardValue(raw: string): CardValue {
  const trimmed = raw.trim();
  if (trimmed === '?') return '?';
  return Number(trimmed);
}

export function CardSetModal({ currentCardSet, isDarkMode, onApply, onClose }: Props) {
  const isCurrentCustom = !CARD_PRESETS.slice(0, -1).some((p) => p.name === currentCardSet.name);
  const [selected, setSelected] = useState<string>(isCurrentCustom ? 'custom' : currentCardSet.name);
  const [customCards, setCustomCards] = useState<string[]>(
    isCurrentCustom && currentCardSet.cards.length
      ? currentCardSet.cards.map(String)
      : ['', ''],
  );
  const [customError, setCustomError] = useState('');

  const updateCard = (index: number, value: string) => {
    if (!isValidCardValue(value)) return;
    setCustomError('');
    setCustomCards((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const addCard = () => {
    if (customCards.length < MAX_CUSTOM_CARDS) {
      setCustomCards((prev) => [...prev, '']);
    }
  };

  const removeCard = (index: number) => {
    setCustomCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    if (selected === 'custom') {
      const filled = customCards.map((v) => v.trim()).filter(Boolean);
      const invalid = filled.filter((v) => !isValidCardValue(v));
      if (invalid.length) {
        setCustomError('Cards must be numbers or ?');
        return;
      }

      const cards: CardValue[] = filled.map(toCardValue);

      if (cards.length < 2) {
        setCustomError('Add at least 2 cards.');
        return;
      }
      const scoreValues = cards.filter((v): v is number => typeof v === 'number');
      onApply({ name: 'custom', label: 'Custom', cards, scoreValues });
    } else {
      const preset = CARD_PRESETS.find((p) => p.name === selected);
      if (preset) onApply(preset);
    }
    onClose();
  };

  const presets = CARD_PRESETS.slice(0, -1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full max-w-md rounded-4xl p-8 shadow-[0_28px_70px_rgba(15,23,42,0.28)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Card Set</h3>
            <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Choose which values to show for voting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`cursor-pointer flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setSelected(preset.name)}
              className={`cursor-pointer w-full rounded-2xl px-4 py-3.5 text-left transition ${
                selected === preset.name
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'border border-slate-800 bg-slate-950 text-white hover:bg-slate-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
              }`}
            >
              <p className="font-black">{preset.label}</p>
              <p className={`mt-0.5 text-sm ${selected === preset.name ? 'text-blue-200' : 'text-slate-500'}`}>
                {preset.cards.join(', ')}
              </p>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSelected('custom')}
            className={`cursor-pointer w-full rounded-2xl px-4 py-3.5 text-left transition ${
              selected === 'custom'
                ? 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'border border-slate-800 bg-slate-950 text-white hover:bg-slate-800'
                  : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
            }`}
          >
            <p className="font-black">Custom</p>
            <p className={`mt-0.5 text-sm ${selected === 'custom' ? 'text-blue-200' : 'text-slate-500'}`}>
              Build your own card set
            </p>
          </button>

          {selected === 'custom' && (
            <div className={`rounded-2xl p-4 ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50'}`}>
              <div className="flex flex-wrap gap-2">
                {customCards.map((val, i) => (
                  <div key={i} className="relative">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateCard(i, e.target.value)}
                      maxLength={3}
                      placeholder="?"
                      className={`h-16 w-12 rounded-2xl border-2 text-center text-lg font-black outline-none transition focus:border-blue-500 ${!isValidCardValue(val) && val !== '' ? 'border-red-500' : isDarkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-600' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-300'}`}
                    />
                    {customCards.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeCard(i)}
                        className="cursor-pointer absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 text-white hover:bg-red-500 transition"
                        aria-label="Remove card"
                      >
                        <X size={9} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}

                {customCards.length < MAX_CUSTOM_CARDS && (
                  <button
                    type="button"
                    onClick={addCard}
                    className={`cursor-pointer h-16 w-12 rounded-2xl border-2 border-dashed text-center transition flex items-center justify-center ${isDarkMode ? 'border-slate-700 text-slate-600 hover:border-slate-500 hover:text-slate-400' : 'border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500'}`}
                    aria-label="Add card"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              <p className={`mt-3 text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {customCards.length}/{MAX_CUSTOM_CARDS} cards · Only numbers or <span className="font-black">?</span> allowed
              </p>

              {customError && (
                <p className="mt-2 text-xs font-semibold text-red-500">{customError}</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="cursor-pointer mt-6 w-full rounded-2xl bg-blue-600 py-3 font-black text-white shadow-lg hover:bg-blue-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
