"use client";
import { ChevronRight } from 'lucide-react';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { CardSet, RoomState, User } from '@/types';
import { DEFAULT_CARD_SET, SOCKET_URL, THEME_STORAGE_KEY } from './lib/constants';
import { normalizeJobRole } from './lib/scoring';
import { joinSchema, joinHostSchema, profileSchema } from './lib/schemas';
import { JoinScreen } from './components/JoinScreen';
import { InviteLink } from './components/InviteLink';
import { HostCard } from './components/HostCard';
import { HostControls } from './components/HostControls';
import { TicketDisplay } from './components/TicketDisplay';
import { VotingCards } from './components/VotingCards';
import { ResultsSummary } from './components/ResultsSummary';
import { ParticipantsPanel } from './components/ParticipantsPanel';
import { ProfileModal } from './components/ProfileModal';
import { HistoryModal } from './components/HistoryModal';
import { CardSetModal } from './components/CardSetModal';
import { AllVotedBanner } from './components/AllVotedBanner';
import { PokedBanner } from './components/PokedBanner';

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
  const [isCardSetModalOpen, setIsCardSetModalOpen] = useState(false);
  const [allVotedAlert, setAllVotedAlert] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  const activeRoomId = roomId || roomIdFromUrl;
  const inviteLink =
    activeRoomId && typeof window !== 'undefined'
      ? `${window.location.origin}/?room=${activeRoomId}`
      : '';
  const isDarkMode = (themePreference === 'system' ? systemTheme : themePreference) === 'dark';

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const animationFrame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemePreference(stored);
      }
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    });
    const handleChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
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
      if (nextRoom.revealed) setAllVotedAlert(false);
    });
    socket.on('all_voted', () => setAllVotedAlert(true));
    socket.on('join_error', (message: string) => setJoinError(message));
    socket.on('ticket_update_error', (message: string) => setTicketError(message));
    socket.on('profile_update_error', (message: string) => setProfileError(message));
    socket.on('profile_update_success', () => {
      setProfileError('');
      setIsProfileModalOpen(false);
    });
    socket.on('poked', () => {
      setIsPoked(true);
      try {
        const ctx = new AudioContext();
        const t = ctx.currentTime;
        const chime = (freq: number, start: number, duration: number, vol: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(vol, start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.start(start);
          osc.stop(start + duration);
        };
        chime(784, t, 0.4, 0.35);
        chime(1047, t + 0.14, 0.55, 0.3);
      } catch { /* autoplay blocked */ }
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
      if (socket && latestRoomId) socket.emit('leave_room', latestRoomId);
      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('update_state');
      socket?.off('join_error');
      socket?.off('ticket_update_error');
      socket?.off('profile_update_error');
      socket?.off('profile_update_success');
      socket?.off('all_voted');
      socket?.off('poked');
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [createConnectedSocket]);

  useEffect(() => {
    if (copyStatus !== 'copied') return;
    const timeout = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const me = room?.users.find((u) => u.id === socketId);
  const host = room?.users.find((u) => u.role === 'host');
  const participants = room?.users.filter((u) => u.role !== 'host') ?? [];
  const participantSections = [
    { title: 'Developer', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'developer') },
    { title: 'Test', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'test') },
    { title: 'Observer', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'observer') },
  ];
  const canVote = Boolean(room?.ticket.trim()) && !room?.revealed;
  const cardSet = room?.cardSet ?? DEFAULT_CARD_SET;
  const canChangeCardSet = me?.role === 'host' && !room?.ticket.trim() && !room?.revealed;
  const hasIdleVoters = !room?.revealed && participants.some(u => u.vote === null && normalizeJobRole(u.jobRole) !== 'observer');

  const onPokeVoter = (targetId: string) => {
    socketRef.current?.emit('poke_voter', { roomId: activeRoomId, targetId });
  };
  const onPokeAll = () => {
    socketRef.current?.emit('poke_all', activeRoomId);
  };

  const toggleTheme = () => {
    setThemePreference((current) => {
      const active = current === 'system' ? systemTheme : current;
      return active === 'dark' ? 'light' : 'dark';
    });
  };

  const capitalize = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
  };

  const openProfileModal = (user: User = me!) => {
    if (!user) return;
    setEditName(user.name);
    setEditRole(user.jobRole);
    setProfileError('');
    setIsProfileModalOpen(true);
  };

  const handleProfileSave = () => {
    if (!activeRoomId) return;
    const result = profileSchema.safeParse({ name: editName });
    if (!result.success) {
      setProfileError(result.error.issues[0].message);
      return;
    }
    socketRef.current?.emit('update_profile', {
      roomId: activeRoomId,
      userName: capitalize(editName),
      jobRole: capitalize(editRole),
    });
  };

  const handleApplyCardSet = (nextCardSet: CardSet) => {
    socketRef.current?.emit('update_card_set', { roomId: activeRoomId, cardSet: nextCardSet });
  };

  const joinRoom = (nextRoomId: string, role: 'host' | 'voter') => {
    const socket = socketRef.current;
    if (!socket || !nextRoomId) return;
    setJoinError('');
    setRoomId(nextRoomId);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `${window.location.pathname}?room=${nextRoomId}`);
    }
    socket.emit('join_room', { roomId: nextRoomId, userName: capitalize(userName), role, jobRole: capitalize(jobRole) });
  };

  const handleEnterRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!isInviteJoin) {
      const result = joinHostSchema.safeParse({ name: userName });
      if (!result.success) { setJoinError(result.error.issues[0].message); return; }
      socket.emit('create_room', (nextRoomId: string) => joinRoom(nextRoomId, 'host'));
      return;
    }
    const result = joinSchema.safeParse({ name: userName, jobRole });
    if (!result.success) { setJoinError(result.error.issues[0].message); return; }
    joinRoom(roomIdFromUrl, 'voter');
  };

  if (!joined) return (
    <JoinScreen
      isDarkMode={isDarkMode}
      isInviteJoin={isInviteJoin}
      roomIdFromUrl={roomIdFromUrl}
      joinError={joinError}
      userName={userName}
      onUserNameChange={(name) => { setUserName(name); if (joinError) setJoinError(''); }}
      jobRole={jobRole}
      onJobRoleChange={(role) => { setJobRole(role); if (joinError) setJoinError(''); }}
      canEnterRoom={userName.trim().length > 0 && (!isInviteJoin || jobRole.length > 0)}
      onEnterRoom={handleEnterRoom}
      onToggleTheme={toggleTheme}
    />
  );

  return (
    <div className={`flex min-h-screen flex-col lg:flex-row font-sans ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'} ${isPoked ? 'animate-shake' : ''}`}>
      <main className="flex flex-1 flex-col items-center px-4 py-4 sm:px-8 sm:py-5 lg:px-12 lg:py-6">
        <header className="mb-3 sm:mb-5 w-full max-w-5xl space-y-3">
          {/* Row 1: title + host card */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Planning Poker
                </h2>
                <img src="/playing-cards.png" alt="" aria-hidden="true" className="h-8 w-auto" />
              </div>
              <p className={`mt-0.5 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Estimate together, deliver better.
              </p>
            </div>
            {host && (
              <HostCard
                host={host}
                isCurrentUser={host.id === me?.id}
                isDarkMode={isDarkMode}
                onOpenProfile={() => openProfileModal(host)}
              />
            )}
          </div>
          {/* Row 2: invite link */}
          {me?.role === 'host' && inviteLink && (
            <InviteLink
              inviteLink={inviteLink}
              isDarkMode={isDarkMode}
              copyStatus={copyStatus}
              onCopy={async () => { await navigator.clipboard.writeText(inviteLink); setCopyStatus('copied'); }}
            />
          )}
          {/* Row 3: tool buttons left, Next Ticket right */}
          {me?.role === 'host' && (
            <div className="flex flex-wrap items-center gap-3">
              <HostControls
                onReveal={() => socketRef.current?.emit('reveal', activeRoomId)}
                onHistory={() => setIsHistoryModalOpen(true)}
                onCardSet={() => setIsCardSetModalOpen(true)}
                onToggleAutoReveal={() => socketRef.current?.emit('toggle_auto_reveal', activeRoomId)}
                onPokeAll={onPokeAll}
                showCardSet={canChangeCardSet}
                autoReveal={room?.autoReveal ?? false}
                hasIdleVoters={hasIdleVoters}
                isDarkMode={isDarkMode}
              />
              <button
                onClick={() => socketRef.current?.emit('next_round', activeRoomId)}
                className="ml-auto cursor-pointer flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition"
              >
                Next Ticket <ChevronRight size={18} />
              </button>
            </div>
          )}
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
          <VotingCards
            myVote={me.vote}
            canVote={canVote}
            isDarkMode={isDarkMode}
            cardSet={cardSet}
            onVote={(val) => socketRef.current?.emit('cast_vote', { roomId: activeRoomId, vote: String(me.vote) === String(val) ? null : val })}
          />
        )}

        {room?.revealed && (
          <ResultsSummary room={room} cardSet={cardSet} isHost={me?.role === 'host'} isDarkMode={isDarkMode} />
        )}
      </main>

      <ParticipantsPanel
        room={room}
        me={me}
        participantSections={participantSections}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenProfile={openProfileModal}
        isHost={me?.role === 'host'}
        onPokeVoter={me?.role === 'host' ? onPokeVoter : undefined}
      />

      {isProfileModalOpen && (
        <ProfileModal
          isDarkMode={isDarkMode}
          isHost={me?.role === 'host'}
          editName={editName}
          onEditNameChange={setEditName}
          editRole={editRole}
          onEditRoleChange={setEditRole}
          error={profileError}
          onErrorClear={() => setProfileError('')}
          onSave={handleProfileSave}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {isHistoryModalOpen && me?.role === 'host' && room && (
        <HistoryModal
          room={room}
          cardSet={cardSet}
          isDarkMode={isDarkMode}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {allVotedAlert && me?.role === 'host' && (
        <AllVotedBanner
          isDarkMode={isDarkMode}
          onReveal={() => {
            socketRef.current?.emit('reveal', activeRoomId);
            setAllVotedAlert(false);
          }}
          onDismiss={() => setAllVotedAlert(false)}
        />
      )}

      {isCardSetModalOpen && me?.role === 'host' && (
        <CardSetModal
          currentCardSet={cardSet}
          isDarkMode={isDarkMode}
          onApply={handleApplyCardSet}
          onClose={() => setIsCardSetModalOpen(false)}
        />
      )}

      {isPoked && (
        <PokedBanner
          isDarkMode={isDarkMode}
          onDismiss={() => setIsPoked(false)}
        />
      )}
    </div>
  );
}
