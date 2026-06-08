import { Moon, Sun } from 'lucide-react';
import { CardSet, RoomState, User } from '@/types';
import { ParticipantCard } from './ParticipantCard';

interface ParticipantSection {
  title: string;
  users: User[];
}

interface Props {
  room: RoomState | null;
  me: User | undefined;
  participantSections: ParticipantSection[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenProfile: (user: User) => void;
}

export function ParticipantsPanel({ room, me, participantSections, isDarkMode, onToggleTheme, onOpenProfile }: Props) {
  const cardSet = room?.cardSet;

  return (
    <aside className={`w-full p-4 sm:p-6 lg:max-w-90 lg:backdrop-blur ${isDarkMode ? 'border-t border-slate-800 bg-slate-900/80 lg:border-l lg:border-t-0' : 'border-t border-slate-200/80 bg-white/70 lg:border-l lg:border-t-0'}`}>
      <div className="lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto pr-1">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            Participants ({room?.users.length ?? 0})
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`cursor-pointer flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="space-y-6">
          {participantSections.map((section) => (
            <div
              key={section.title}
              className={`rounded-3xl p-4 ${isDarkMode ? 'border border-slate-800/90 bg-slate-900/40' : 'border border-slate-200 bg-slate-50/80'}`}
            >
              <div className={`mb-3 flex items-center gap-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                <p className="text-xs font-black uppercase tracking-[0.18em]">
                  {section.title} ({section.users.length})
                </p>
                <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              {section.users.length ? (
                <div className="space-y-4">
                  {section.users.map((user) => (
                    <ParticipantCard
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === me?.id}
                      isObserverSection={section.title === 'Observer'}
                      revealed={room?.revealed ?? false}
                      isDarkMode={isDarkMode}
                      cardSet={cardSet!}
                      onOpenProfile={() => onOpenProfile(user)}
                    />
                  ))}
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
  );
}
