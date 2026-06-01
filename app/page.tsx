"use client";
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { RoomState, User } from '@/types';
import { SOCKET_URL, THEME_STORAGE_KEY, MIN_NAME_LENGTH } from './lib/constants';
import { normalizeJobRole } from './lib/scoring';
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
      if (socket && latestRoomId) socket.emit('leave_room', latestRoomId);
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

  const me = room?.users.find((u) => u.id === socketId);
  const host = room?.users.find((u) => u.role === 'host');
  const participants = room?.users.filter((u) => u.role !== 'host') ?? [];
  const participantSections = [
    { title: 'Developer', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'developer') },
    { title: 'Test', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'test') },
    { title: 'Observer', users: participants.filter((u) => normalizeJobRole(u.jobRole) === 'observer') },
  ];
  const canVote = Boolean(room?.ticket.trim()) && !room?.revealed;

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
      userName: capitalize(editName),
      jobRole: capitalize(editRole),
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
      socket.emit('create_room', (nextRoomId: string) => joinRoom(nextRoomId, 'host'));
      return;
    }
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
      canEnterRoom={userName.trim().length > 0}
      onEnterRoom={handleEnterRoom}
      onToggleTheme={toggleTheme}
    />
  );

  return (
    <div className={`flex min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
      <main className="flex flex-1 flex-col items-center p-12">
        <header className="mb-10 flex w-full max-w-5xl items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
              Planning Poker
            </h2>
            {me?.role === 'host' && inviteLink && (
              <InviteLink
                inviteLink={inviteLink}
                isDarkMode={isDarkMode}
                copyStatus={copyStatus}
                onCopy={async () => { await navigator.clipboard.writeText(inviteLink); setCopyStatus('copied'); }}
              />
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {host && (
              <HostCard
                host={host}
                isCurrentUser={host.id === me?.id}
                isDarkMode={isDarkMode}
                onOpenProfile={() => openProfileModal(host)}
              />
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
          <VotingCards
            myVote={me.vote}
            canVote={canVote}
            isDarkMode={isDarkMode}
            onVote={(val) => socketRef.current?.emit('cast_vote', { roomId: activeRoomId, vote: me.vote === val ? null : val })}
          />
        )}

        {room?.revealed && (
          <ResultsSummary room={room} isHost={me?.role === 'host'} isDarkMode={isDarkMode} />
        )}
      </main>

      <ParticipantsPanel
        room={room}
        me={me}
        participantSections={participantSections}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenProfile={openProfileModal}
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
          isDarkMode={isDarkMode}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  );
}
