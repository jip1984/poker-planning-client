"use client";
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Clock3, Moon, Sun } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { RoomState } from '@/types';
import { HostControls } from './components/HostControls';
import { TicketDisplay } from './components/TicketDisplay';

const CARDS = [1, 3, 5, 8, 13, '?'];
const COLORS: Record<string, string> = { 1:'#81C784', 3:'#4CAF50', 5:'#FFB74D', 8:'#EF5350', 13:'#8C4343', '?':'#cbd5e1' };
const SCORE_VALUES = [1, 3, 5, 8, 13];
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
const THEME_STORAGE_KEY = 'planning-poker-theme';

type ThemePreference = 'light' | 'dark' | 'system';

export default function App() {
  return (
    <Suspense fallback={null}>
      <PokerPlanningPage />
    </Suspense>
  );
}

function PokerPlanningPage() {
  const searchParams = useSearchParams();
  const socketRef = useRef<Socket | null>(null);
  const activeRoomIdRef = useRef('');
  const roomIdFromUrl = searchParams.get('room')?.trim().toLowerCase() ?? '';
  const isInviteJoin = roomIdFromUrl.length > 0;
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [socketId, setSocketId] = useState('');
  const [userName, setUserName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [roomId, setRoomId] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [joinError, setJoinError] = useState('');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const activeRoomId = roomId || roomIdFromUrl;
  const inviteLink = activeRoomId && typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${activeRoomId}`
    : '';
  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
      setThemePreference(storedPreference);
    }

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference]);

  const attachSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => setSocketId(socket.id ?? ''));
    socket.on('disconnect', () => setSocketId(''));
    socket.on('update_state', (nextRoom) => {
      setRoom(nextRoom);
      setJoinError('');
      setJoined(true);
    });
    socket.on('join_error', (message: string) => setJoinError(message));
  }, []);

  const createConnectedSocket = useCallback(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    attachSocketListeners(socket);
    return socket;
  }, [attachSocketListeners]);

  useEffect(() => {
    createConnectedSocket();

    return () => {
      const socket = socketRef.current;
      const latestRoomId = activeRoomIdRef.current;

      if (socket && latestRoomId) {
        socket.emit('leave_room', latestRoomId);
      }

      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('update_state');
      socket?.off('join_error');
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [createConnectedSocket]);

  useEffect(() => {
    if (copyStatus !== 'copied') return;

    const timeout = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const me = room?.users.find(u => u.id === socketId);
  const host = room?.users.find((user) => user.role === 'host');
  const participants = room?.users.filter((user) => user.role !== 'host') ?? [];
  const canEnterRoom = userName.trim().length > 0;
  const canVote = Boolean(room?.ticket.trim()) && !room?.revealed;
  const toggleTheme = () => {
    setThemePreference((current) => {
      const activeTheme = current === 'system' ? systemTheme : current;
      return activeTheme === 'dark' ? 'light' : 'dark';
    });
  };
  const formatDisplayName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return '';

    return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
  };
  const formatJobRole = (roleName: string) => {
    const trimmedRole = roleName.trim();
    if (!trimmedRole) return '';

    return trimmedRole.charAt(0).toUpperCase() + trimmedRole.slice(1);
  };

  const joinRoom = (nextRoomId: string, role: 'host' | 'voter') => {
    if (!nextRoomId || !userName.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;
    const formattedUserName = formatDisplayName(userName);
    const formattedJobRole = formatJobRole(jobRole);
    setJoinError('');

    setRoomId(nextRoomId);

    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}?room=${nextRoomId}`;
      window.history.replaceState({}, '', nextUrl);
    }

    socket.emit('join_room', { roomId: nextRoomId, userName: formattedUserName, role, jobRole: formattedJobRole });
  };

  const handleEnterRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!isInviteJoin) {
      socket.emit('create_room', (nextRoomId: string) => {
        joinRoom(nextRoomId, 'host');
      });
      return;
    }

    joinRoom(roomIdFromUrl, 'voter');
  };

  if (!joined) return (
    <div className={`flex min-h-screen items-center justify-center px-6 ${isDarkMode ? 'bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#111827_40%,_#020617_100%)]' : 'bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f7f9fc_42%,_#edf2f7_100%)]'}`}>
      <button
        type="button"
        onClick={toggleTheme}
        className={`fixed right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full transition ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'} shadow-sm`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className={`w-full max-w-[380px] rounded-[2.15rem] px-10 py-11 shadow-[0_28px_70px_rgba(15,23,42,0.16)] backdrop-blur ${isDarkMode ? 'border border-slate-700/80 bg-slate-900/95' : 'border border-white/80 bg-white/95'}`}>
        <h1 className={`text-center text-[2.05rem] font-black uppercase tracking-[-0.06em] ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Planning Poker
        </h1>
        <div className="mb-4 mt-1 flex justify-center">
          <img
            src="/playing-cards.png"
            alt="Planning poker cards"
            className="h-auto w-full max-w-[240px]"
          />
        </div>

        {isInviteJoin && (
          <div className={`mb-4 rounded-[1.15rem] px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-400' : 'border border-slate-200 bg-white text-slate-400'}`}>
            Room {roomIdFromUrl}
          </div>
        )}

        <input
          value={userName}
          onChange={e => {
            setUserName(e.target.value);
            if (joinError) setJoinError('');
          }}
          placeholder="Please enter your name"
          className={`mb-4 h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
        />

        {isInviteJoin && (
          <input
            value={jobRole}
            onChange={e => {
              setJobRole(e.target.value);
              if (joinError) setJoinError('');
            }}
            placeholder="Role optional (e.g. developer, tester, etc.)"
            className={`mb-8 h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
          />
        )}

        {joinError && (
          <p className="mb-4 text-center text-sm font-semibold text-rose-500">
            {joinError}
          </p>
        )}

        <button
          type="button"
          onClick={handleEnterRoom}
          disabled={!canEnterRoom}
          className={`h-14 w-full cursor-pointer rounded-[1.15rem] text-lg font-extrabold shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none ${isDarkMode ? 'bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-slate-100' : 'bg-black text-white hover:-translate-y-0.5 hover:bg-slate-950'}`}
        >
          {isInviteJoin ? 'Join Room' : 'Create Room'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
      <main className="flex-1 p-12 flex flex-col items-center">
        <header className="mb-10 flex w-full max-w-5xl items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Planning Poker</h2>
            {me?.role === 'host' && inviteLink && (
              <div className={`mt-4 flex max-w-2xl flex-wrap items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}>
                <span className={`text-xs font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Invite Link</span>
                <p className={`min-w-0 flex-1 truncate text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{inviteLink}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteLink);
                    setCopyStatus('copied');
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition ${
                    copyStatus === 'copied' ? 'bg-emerald-500 text-white hover:bg-emerald-500' : isDarkMode ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-black text-white hover:bg-slate-900'
                  }`}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-start gap-3">
            {me?.role === 'host' && (
              <HostControls 
                onReveal={() => socketRef.current?.emit('reveal', activeRoomId)} 
                onNext={() => socketRef.current?.emit('next_round', activeRoomId)}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </header>

        <TicketDisplay 
          ticket={room?.ticket || ''} 
          isHost={me?.role === 'host'} 
          onUpdate={(ticket: string) => socketRef.current?.emit('update_ticket', { roomId: activeRoomId, ticket })}
          isDarkMode={isDarkMode}
        />

        {me?.role === 'voter' && (
          <div className="flex flex-col items-center">
            <div className="flex gap-4">
              {CARDS.map(val => (
                <button key={val} disabled={!canVote} onClick={() => socketRef.current?.emit('cast_vote', { roomId: activeRoomId, vote: me.vote === val ? null : val })}
                  style={{ backgroundColor: COLORS[val] }}
                  className={`w-24 h-36 rounded-3xl text-4xl font-black text-white shadow-xl transition-all ${canVote ? 'cursor-pointer hover:-translate-y-4' : 'cursor-not-allowed opacity-45'} ${me.vote === val ? 'ring-[10px] ring-blue-400/40 scale-105' : ''}`}>
                  {val}
                </button>
              ))}
            </div>
            {canVote && (
              <p className={`mt-8 text-2xl font-black tracking-[0.08em] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                Ready, steady, estimate!
              </p>
            )}
          </div>
        )}

        {room?.revealed && (
          <div className="mt-12 flex items-center justify-center">
            <div
              style={{ backgroundColor: getAverageCardColor(room) }}
              className="flex h-44 w-32 items-center justify-center rounded-[2rem] text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
            >
              {calculateAvg(room)}
            </div>
          </div>
        )}
      </main>

      <aside className={`w-full max-w-[360px] p-6 backdrop-blur ${isDarkMode ? 'border-l border-slate-800 bg-slate-900/80' : 'border-l border-slate-200/80 bg-white/70'}`}>
        <div className="sticky top-0 max-h-screen overflow-y-auto pr-1">
          <div className="mb-6 flex items-center justify-between">
            <p className={`text-sm font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Participants ({room?.users.length ?? 0})
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="space-y-6">
            {host && (
              <div>
                <p className={`mb-3 text-xs font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Host</p>
                <div className={`rounded-[1.7rem] px-4 py-4 shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-black uppercase text-blue-600">
                      {host.name.slice(0, 1) || '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        title={host.name}
                        className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      >
                        {host.name}
                      </p>
                      <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-500">
                        {host.id === me?.id ? 'You' : 'Host'}
                      </p>
                    </div>

                    <div className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
                      Managing
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className={`mb-3 text-xs font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Voters ({participants.length})
              </p>

              <div className="space-y-4">
                {participants.map((user) => {
                  const isCurrentUser = user.id === me?.id;
                  const hasVoted = user.vote !== null;
                  const showVoteValue = room?.revealed && user.vote !== null;
                  const participantLabel = isCurrentUser ? 'YOU' : (user.jobRole || 'VOTER').toUpperCase();

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 rounded-[1.55rem] px-4 py-3.5 shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/70'}`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-black uppercase text-blue-600">
                        {user.name.slice(0, 1) || '?'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          title={user.name}
                          className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        >
                          {user.name}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-500">
                          {participantLabel}
                        </p>
                      </div>

                      <div className="flex min-w-[88px] items-center justify-end">
                        {showVoteValue ? (
                          <div
                            style={{ backgroundColor: COLORS[String(user.vote)] }}
                            className="flex h-14 w-11 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
                          >
                            {user.vote}
                          </div>
                        ) : hasVoted ? (
                          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600">
                            <Check size={14} strokeWidth={3} />
                            Voted
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-600">
                            <Clock3 size={14} strokeWidth={2.5} />
                            Waiting
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!room?.users.length && (
              <div className={`rounded-[1.75rem] px-5 py-6 text-center text-sm font-semibold shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950 text-slate-500' : 'border border-slate-200 bg-slate-50/70 text-slate-400'}`}>
                Waiting for people to join...
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function calculateAvg(room: RoomState) {
  const submittedVotes = room.users
    .map((u) => u.vote)
    .filter((vote): vote is number | '?' => vote !== null);

  if (submittedVotes.length > 0 && submittedVotes.every((vote) => vote === '?')) {
    return '?';
  }

  const votes = room.users
    .filter((u): u is typeof u & { vote: number } => typeof u.vote === 'number')
    .map((u) => u.vote)
    .sort((a, b) => a - b);

  if (!votes.length) return '1';

  const middleIndex = Math.floor(votes.length / 2);
  const median = votes.length % 2 === 0
    ? (votes[middleIndex - 1] + votes[middleIndex]) / 2
    : votes[middleIndex];

  const closestScore = SCORE_VALUES.reduce((closest, current) => {
    return Math.abs(current - median) < Math.abs(closest - median) ? current : closest;
  }, SCORE_VALUES[0]);

  return String(closestScore);
}

function getAverageCardColor(room: RoomState) {
  const calculatedAverage = calculateAvg(room);

  if (calculatedAverage === '?') {
    return COLORS['?'];
  }

  const average = Number(calculatedAverage);
  const nearestCard = SCORE_VALUES.reduce((closest, current) => {
    return Math.abs(current - average) < Math.abs(closest - average) ? current : closest;
  }, SCORE_VALUES[0]);

  return COLORS[String(nearestCard)];
}
