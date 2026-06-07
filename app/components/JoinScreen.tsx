import { ChevronDown, Moon, Sun } from 'lucide-react';
import { Footer } from './Footer';

interface Props {
  isDarkMode: boolean;
  isInviteJoin: boolean;
  roomIdFromUrl: string;
  joinError: string;
  userName: string;
  onUserNameChange: (name: string) => void;
  jobRole: string;
  onJobRoleChange: (role: string) => void;
  canEnterRoom: boolean;
  onEnterRoom: () => void;
  onToggleTheme: () => void;
}

export function JoinScreen({
  isDarkMode,
  isInviteJoin,
  roomIdFromUrl,
  joinError,
  userName,
  onUserNameChange,
  jobRole,
  onJobRoleChange,
  canEnterRoom,
  onEnterRoom,
  onToggleTheme,
}: Props) {
  return (
    <div className={`relative flex min-h-screen items-center justify-center px-6 ${isDarkMode ? 'bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#111827_40%,_#020617_100%)]' : 'bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f7f9fc_42%,_#edf2f7_100%)]'}`}>
      <button
        type="button"
        onClick={onToggleTheme}
        className={`fixed right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`w-full max-w-[380px] rounded-[2.15rem] px-10 py-11 shadow-[0_28px_70px_rgba(15,23,42,0.16)] backdrop-blur ${isDarkMode ? 'border border-slate-700/80 bg-slate-900/95' : 'border border-white/80 bg-white/95'}`}>
        <h1 className={`text-center text-[2.05rem] font-black uppercase tracking-[-0.06em] ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Planning Poker
        </h1>
        <div className="mb-4 mt-1 flex justify-center">
          <img src="/playing-cards.png" alt="Planning poker cards" className="h-auto w-full max-w-[240px]" />
        </div>

        {isInviteJoin && (
          <div className={`mb-4 rounded-[1.15rem] px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-400' : 'border border-slate-200 bg-white text-slate-400'}`}>
            Room {roomIdFromUrl}
          </div>
        )}

        {joinError && (
          <p className="mb-3 text-sm font-semibold text-rose-500">{joinError}</p>
        )}

        <input
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          placeholder="Please enter your name"
          className={`mb-4 h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
        />

        {isInviteJoin && (
          <div className="relative mb-8">
            <select
              value={jobRole}
              onChange={(e) => onJobRoleChange(e.target.value)}
              className={`h-14 w-full appearance-none rounded-[1.15rem] px-5 pr-14 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 focus:border-slate-300'} ${jobRole ? (isDarkMode ? 'text-slate-100' : 'text-slate-700') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
            >
              <option value="">Select a role</option>
              <option value="Developer">Developer</option>
              <option value="Test">Test</option>
              <option value="Observer">Observer</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-5 flex items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <ChevronDown size={20} />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onEnterRoom}
          disabled={!canEnterRoom}
          className={`h-14 w-full cursor-pointer rounded-[1.15rem] text-lg font-extrabold shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none ${isDarkMode ? 'bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-slate-100' : 'bg-black text-white hover:-translate-y-0.5 hover:bg-slate-950'}`}
        >
          {isInviteJoin ? 'Join Room' : 'Create Room'}
        </button>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
