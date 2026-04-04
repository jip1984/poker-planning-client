"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Clock3 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { RoomState } from '@/types';
import { HostControls } from './components/HostControls';
import { TicketDisplay } from './components/TicketDisplay';

const CARDS = [1, 3, 5, 8, 13, '?'];
const COLORS: Record<string, string> = { 1:'#81C784', 3:'#4CAF50', 5:'#FFB74D', 8:'#EF5350', 13:'#8C4343', '?':'#cbd5e1' };
const SCORE_VALUES = [1, 3, 5, 8, 13];
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

export default function App() {
  const searchParams = useSearchParams();
  const socketRef = useRef<Socket | null>(null);
  const activeRoomIdRef = useRef('');
  const roomIdFromUrl = searchParams.get('room')?.trim().toLowerCase() ?? '';
  const isInviteJoin = roomIdFromUrl.length > 0;
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [socketId, setSocketId] = useState('');
  const [userName, setUserName] = useState('');
  const [isHost, setIsHost] = useState(!isInviteJoin);
  const [roomId, setRoomId] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const activeRoomId = roomId || roomIdFromUrl;
  const inviteLink = activeRoomId && typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${activeRoomId}`
    : '';

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  const attachSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => setSocketId(socket.id ?? ''));
    socket.on('disconnect', () => setSocketId(''));
    socket.on('update_state', setRoom);
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
  const canEnterRoom = userName.trim().length > 0 && (isHost || isInviteJoin);

  const joinRoom = (nextRoomId: string, role: 'host' | 'voter') => {
    if (!nextRoomId || !userName.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;

    setRoomId(nextRoomId);

    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}?room=${nextRoomId}`;
      window.history.replaceState({}, '', nextUrl);
    }

    socket.emit('join_room', { roomId: nextRoomId, userName: userName.trim(), role });
    setJoined(true);
  };

  const handleEnterRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;

    if (isHost) {
      socket.emit('create_room', (nextRoomId: string) => {
        joinRoom(nextRoomId, 'host');
      });
      return;
    }

    joinRoom(roomIdFromUrl, 'voter');
  };

  if (!joined) return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f7f9fc_42%,_#edf2f7_100%)] px-6">
      <div className="w-full max-w-[380px] rounded-[2.15rem] border border-white/80 bg-white/95 px-10 py-11 shadow-[0_28px_70px_rgba(15,23,42,0.16)] backdrop-blur">
        <h1 className="mb-10 text-center text-[2.05rem] font-black uppercase tracking-[-0.06em] text-black">
          Planning Poker
        </h1>

        <input
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Name"
          className="mb-4 h-14 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50/60 px-5 text-base font-medium text-slate-700 outline-none transition placeholder:text-slate-200 focus:border-slate-300"
        />

        {!isInviteJoin && (
          <button
            type="button"
            onClick={() => setIsHost(!isHost)}
            className={`mb-8 flex h-14 w-full cursor-pointer items-center justify-center rounded-[1.15rem] border px-5 text-base font-bold transition ${
              isHost
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-300'
            }`}
          >
            Host
          </button>
        )}

        {isInviteJoin && (
          <div className="mb-8 rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Room {roomIdFromUrl}
          </div>
        )}

        <button
          type="button"
          onClick={handleEnterRoom}
          disabled={!canEnterRoom}
          className="h-14 w-full cursor-pointer rounded-[1.15rem] bg-black text-lg font-extrabold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isHost ? 'Create Room' : 'Join Room'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <main className="flex-1 p-12 flex flex-col items-center">
        <header className="mb-10 flex w-full max-w-5xl items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-tight text-slate-700">Planning Poker</h2>
            {me?.role === 'host' && inviteLink && (
              <div className="mt-4 flex max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Invite Link</span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600">{inviteLink}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteLink);
                    setCopyStatus('copied');
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
                    copyStatus === 'copied' ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-black hover:bg-slate-900'
                  }`}
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          {me?.role === 'host' && (
            <HostControls 
              onReveal={() => socketRef.current?.emit('reveal', activeRoomId)} 
              onNext={() => socketRef.current?.emit('next_round', activeRoomId)} 
            />
          )}
        </header>

        <TicketDisplay 
          ticket={room?.ticket || ''} 
          isHost={me?.role === 'host'} 
          onUpdate={(ticket: string) => socketRef.current?.emit('update_ticket', { roomId: activeRoomId, ticket })}
        />

        {me?.role === 'voter' && (
          <div className="flex gap-4">
            {CARDS.map(val => (
              <button key={val} onClick={() => socketRef.current?.emit('cast_vote', { roomId: activeRoomId, vote: val })}
                style={{ backgroundColor: COLORS[val] }}
                className={`cursor-pointer w-24 h-36 rounded-3xl text-4xl font-black text-white shadow-xl transition-all hover:-translate-y-4 ${me.vote === val ? 'ring-[10px] ring-blue-400/40 scale-105' : ''}`}>
                {val}
              </button>
            ))}
          </div>
        )}

        {room?.revealed && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div
              style={{ backgroundColor: getAverageCardColor(room) }}
              className="flex h-44 w-32 items-center justify-center rounded-[2rem] text-5xl font-black text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]"
            >
              {calculateAvg(room)}
            </div>
            <p className="text-4xl font-black text-black">Average: {calculateAvg(room)}</p>
          </div>
        )}
      </main>

      <aside className="w-full max-w-[380px] border-l border-slate-200/80 bg-white/70 p-8 backdrop-blur">
        <div className="sticky top-0">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Participants ({room?.users.length ?? 0})
          </p>

          <div className="space-y-6">
            {host && (
              <div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Host</p>
                <div className="rounded-[1.9rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-black uppercase text-blue-600">
                      {host.name.slice(0, 1) || '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-black text-slate-900">{host.name}</p>
                      <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-500">
                        {host.id === me?.id ? 'You' : 'Host'}
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      Managing
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Voters ({participants.length})
              </p>

              <div className="space-y-4">
                {participants.map((user) => {
                  const isCurrentUser = user.id === me?.id;
                  const hasVoted = user.vote !== null;
                  const showVoteValue = room?.revealed && user.vote !== null;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 px-5 py-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-black uppercase text-blue-600">
                        {user.name.slice(0, 1) || '?'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-black text-slate-900">{user.name}</p>
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-500">
                          {isCurrentUser ? 'You' : 'Voter'}
                        </p>
                      </div>

                      <div className="flex min-w-[96px] items-center justify-end">
                        {showVoteValue ? (
                          <div
                            style={{ backgroundColor: COLORS[String(user.vote)] }}
                            className="flex h-16 w-12 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                          >
                            {user.vote}
                          </div>
                        ) : hasVoted ? (
                          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-600">
                            <Check size={16} strokeWidth={3} />
                            Voted
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-black text-amber-600">
                            <Clock3 size={16} strokeWidth={2.5} />
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
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 px-5 py-6 text-center text-sm font-semibold text-slate-400 shadow-sm">
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
  const average = Number(calculateAvg(room));
  const nearestCard = SCORE_VALUES.reduce((closest, current) => {
    return Math.abs(current - average) < Math.abs(closest - average) ? current : closest;
  }, SCORE_VALUES[0]);

  return COLORS[String(nearestCard)];
}
