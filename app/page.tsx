"use client";
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Clock3, Moon, Sun, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { RoomState, TicketHistoryEntry, User } from '@/types';
import { HostControls } from './components/HostControls';
import { TicketDisplay } from './components/TicketDisplay';

const CARDS = [1, 3, 5, 8, 13, '?'];
const COLORS: Record<string, string> = { 1:'#81C784', 3:'#4CAF50', 5:'#FFB74D', 8:'#EF5350', 13:'#8C4343', '?':'#cbd5e1' };
const SCORE_VALUES = [1, 3, 5, 8, 13];
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
const THEME_STORAGE_KEY = 'planning-poker-theme';
const MIN_NAME_LENGTH = 3;

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
  const [ticketError, setTicketError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
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
    const animationFrame = window.requestAnimationFrame(() => {
      const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
        setThemePreference(storedPreference);
      }

      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    });

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      mediaQuery.removeEventListener('change', handleChange);
    };
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
      setTicketError('');
      setJoined(true);
    });
    socket.on('join_error', (message: string) => setJoinError(message));
    socket.on('ticket_update_error', (message: string) => setTicketError(message));
    socket.on('profile_update_error', (message: string) => setProfileError(message));
    socket.on('profile_update_success', () => {
      setProfileError('');
      setIsProfileModalOpen(false);
    });
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
      socket?.off('ticket_update_error');
      socket?.off('profile_update_error');
      socket?.off('profile_update_success');
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
  const participantSections = [
    { title: 'Developer', users: participants.filter((user) => normalizeJobRole(user.jobRole) === 'developer') },
    { title: 'Test', users: participants.filter((user) => normalizeJobRole(user.jobRole) === 'test') },
    { title: 'Observer', users: participants.filter((user) => normalizeJobRole(user.jobRole) === 'observer') },
  ];
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
  const openProfileModal = (user = me) => {
    if (!user) return;
    setEditName(user.name);
    setEditRole(user.jobRole);
    setProfileError('');
    setIsProfileModalOpen(true);
  };
  const handleProfileSave = () => {
    if (!activeRoomId || !editName.trim()) {
      setProfileError('Please enter a name.');
      return;
    }

    if (editName.trim().length < MIN_NAME_LENGTH) {
      setProfileError(`Name must be at least ${MIN_NAME_LENGTH} characters.`);
      return;
    }

    socketRef.current?.emit('update_profile', {
      roomId: activeRoomId,
      userName: formatDisplayName(editName),
      jobRole: formatJobRole(editRole),
    });
  };

  const joinRoom = (nextRoomId: string, role: 'host' | 'voter') => {
    if (!nextRoomId || !userName.trim()) return;
    if (userName.trim().length < MIN_NAME_LENGTH) {
      setJoinError(`Name must be at least ${MIN_NAME_LENGTH} characters.`);
      return;
    }
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

        {joinError && (
          <p className="mb-3 text-sm font-semibold text-rose-500">
            {joinError}
          </p>
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
          <div className="relative mb-8">
            <select
              value={jobRole}
              onChange={e => {
                setJobRole(e.target.value);
                if (joinError) setJoinError('');
              }}
              className={`h-14 w-full rounded-[1.15rem] px-5 pr-14 text-base font-medium outline-none transition appearance-none ${isDarkMode ? 'border border-slate-700 bg-slate-800 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 focus:border-slate-300'} ${jobRole ? isDarkMode ? 'text-slate-100' : 'text-slate-700' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
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
          <div className="flex flex-col items-end gap-3">
            {host && (
              <button
                type="button"
                onClick={() => host.id === me?.id && openProfileModal(host)}
                className={`min-w-[260px] rounded-[1.5rem] px-4 py-3 text-left shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-900' : 'border border-slate-200 bg-white'} ${host.id === me?.id ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
              >
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
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-500">
                      {host.id === me?.id ? 'You are host' : 'Host'}
                    </p>
                  </div>

                  <div className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
                    Managing
                  </div>
                </div>
              </button>
            )}

            {me?.role === 'host' && (
              <HostControls 
                onReveal={() => socketRef.current?.emit('reveal', activeRoomId)} 
                onHistory={() => setIsHistoryModalOpen(true)}
                onNext={() => socketRef.current?.emit('next_round', activeRoomId)}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </header>

        <TicketDisplay 
          ticket={room?.ticket || ''} 
          isHost={me?.role === 'host'} 
          onUpdate={(ticket: string) => {
            if (ticketError) setTicketError('');
            socketRef.current?.emit('update_ticket', { roomId: activeRoomId, ticket });
          }}
          error={ticketError}
          isDarkMode={isDarkMode}
        />

        {me?.role === 'voter' && !room?.revealed && (
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

        {room?.revealed && me?.role === 'host' && (
          <div className="mt-12 w-full max-w-4xl">
            <div className={`rounded-[1.9rem] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] ${isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/90'}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Revealed Summary
                  </p>
                  <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Averages by role plus the overall estimate
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Developer Average', value: calculateRoleAverage(room, 'Developer') },
                { label: 'Test Average', value: calculateRoleAverage(room, 'Test') },
                { label: 'Observer Average', value: calculateRoleAverage(room, 'Observer') },
                { label: 'Overall Average', value: calculateAvg(room) },
              ].map((item) => (
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
                    <p className={`text-sm leading-5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.value === '-' ? 'No votes yet' : 'Based on revealed votes'}
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {room?.revealed && me?.role !== 'host' && (
          <div className="mt-8 flex min-h-[16rem] flex-col items-center justify-start">
            <p className={`mb-5 text-sm font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Overall Average
            </p>
            <div
              style={{ backgroundColor: getScoreColor(calculateAvg(room)) }}
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
            {participantSections.map((section) => (
              <div
                key={section.title}
                className={`rounded-[1.5rem] p-4 ${isDarkMode ? 'border border-slate-800/90 bg-slate-900/40' : 'border border-slate-200 bg-slate-50/80'}`}
              >
                <div className={`mb-3 flex items-center gap-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    {section.title} ({section.users.length})
                  </p>
                  <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>

                {section.users.length ? (
                  <div className="space-y-4">
                    {section.users.map((user) => {
                      const isCurrentUser = user.id === me?.id;
                      const hasVoted = user.vote !== null;
                      const showVoteValue = room?.revealed && user.vote !== null;
                      const participantLabel = isCurrentUser ? 'YOU' : section.title.toUpperCase();
                      const isObserverSection = section.title === 'Observer';

                      return (
                        <button
                          type="button"
                          key={user.id}
                          onClick={() => isCurrentUser && openProfileModal(user)}
                          className={`flex w-full items-center gap-3 rounded-[1.55rem] px-4 py-3.5 text-left shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/70'} ${isCurrentUser ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
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
                              isObserverSection ? (
                                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                                  Optional
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-600">
                                  <Clock3 size={14} strokeWidth={2.5} />
                                  Waiting
                                </div>
                              )
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`rounded-[1.35rem] px-4 py-4 text-sm font-medium ${isDarkMode ? 'border border-slate-800 bg-slate-950 text-slate-500' : 'border border-slate-200 bg-slate-50/70 text-slate-400'}`}>
                    No {section.title.toLowerCase()}s yet.
                  </div>
                )}
              </div>
            ))}

            {!room?.users.length && (
              <div className={`rounded-[1.75rem] px-5 py-6 text-center text-sm font-semibold shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950 text-slate-500' : 'border border-slate-200 bg-slate-50/70 text-slate-400'}`}>
                Waiting for people to join...
              </div>
            )}
          </div>
        </div>
      </aside>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[2rem] p-8 shadow-[0_28px_70px_rgba(15,23,42,0.28)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-6">
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h3>
              <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Update the name and role everyone sees in this room.
              </p>
            </div>

            <div className="space-y-4">
              {profileError && (
                <p className="text-sm font-semibold text-rose-500">
                  {profileError}
                </p>
              )}
              <input
                value={editName}
                onChange={(event) => {
                  setEditName(event.target.value);
                  if (profileError) setProfileError('');
                }}
                placeholder="Name"
                className={`h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
              />
              {me?.role !== 'host' && (
                <input
                  value={editRole}
                  onChange={(event) => {
                    setEditRole(event.target.value);
                    if (profileError) setProfileError('');
                  }}
                  placeholder="Role optional (e.g. dev, test)"
                  className={`h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
                />
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setProfileError('');
                }}
                className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProfileSave}
                className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && me?.role === 'host' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-[2rem] p-8 shadow-[0_28px_70px_rgba(15,23,42,0.28)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Session History</h3>
                <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Completed tickets stay here until this room session ends.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                aria-label="Close history"
              >
                <X size={18} />
              </button>
            </div>

            {room?.history?.length ? (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {room.history.map((entry, index) => (
                  <div
                    key={`${entry.completedAt}-${entry.ticket}-${index}`}
                    className={`flex items-center gap-4 rounded-[1.5rem] px-5 py-4 ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/80'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        title={entry.ticket}
                        className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      >
                        {entry.ticket}
                      </p>
                      <p className={`mt-1 text-xs font-bold uppercase tracking-[0.14em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {formatHistoryTimestamp(entry)}
                      </p>
                    </div>

                    <div
                      style={{ backgroundColor: COLORS[String(entry.score)] ?? '#2563eb' }}
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
      )}
    </div>
  );
}

function calculateAvg(room: RoomState) {
  return calculateAverageForUsers(room.users) ?? '1';
}

function calculateRoleAverage(room: RoomState, jobRole: string) {
  return calculateAverageForUsers(
    room.users.filter((user) => normalizeJobRole(user.jobRole) === normalizeJobRole(jobRole))
  ) ?? '-';
}

function calculateAverageForUsers(users: User[]) {
  const submittedVotes = users
    .map((user) => user.vote)
    .filter((vote): vote is number | '?' => vote !== null);

  if (submittedVotes.length > 0 && submittedVotes.every((vote) => vote === '?')) {
    return '?';
  }

  const votes = users
    .filter((user): user is User & { vote: number } => typeof user.vote === 'number')
    .map((user) => user.vote)
    .sort((a, b) => a - b);

  if (!votes.length) return null;

  const middleIndex = Math.floor(votes.length / 2);
  const median = votes.length % 2 === 0
    ? (votes[middleIndex - 1] + votes[middleIndex]) / 2
    : votes[middleIndex];

  const closestScore = SCORE_VALUES.reduce((closest, current) => {
    return Math.abs(current - median) < Math.abs(closest - median) ? current : closest;
  }, SCORE_VALUES[0]);

  return String(closestScore);
}

function normalizeJobRole(jobRole: string) {
  return jobRole.trim().toLowerCase();
}

function getScoreColor(score: string) {
  if (score === '?') {
    return COLORS['?'];
  }

  if (score === '-') {
    return '#475569';
  }

  const average = Number(score);
  const nearestCard = SCORE_VALUES.reduce((closest, current) => {
    return Math.abs(current - average) < Math.abs(closest - average) ? current : closest;
  }, SCORE_VALUES[0]);

  return COLORS[String(nearestCard)];
}

function formatHistoryTimestamp(entry: TicketHistoryEntry) {
  const completedAt = new Date(entry.completedAt);

  if (Number.isNaN(completedAt.getTime())) {
    return 'Completed just now';
  }

  return completedAt.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
