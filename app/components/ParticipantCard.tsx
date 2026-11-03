import { Check, Clock3, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CardSet, User } from '@/types';
import { cardStyle, getCardColor } from '../lib/scoring';

interface Props {
  user: User;
  isCurrentUser: boolean;
  isObserverSection: boolean;
  revealed: boolean;
  isDarkMode: boolean;
  cardSet: CardSet;
  /** Seconds to wait before this card flips, so the room flips one by one. */
  revealDelay?: number;
  onOpenProfile: () => void;
}

// Status badges swap in and out; exits are quicker than entries.
const badgeMotion = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.3, bounce: 0.3 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.15, ease: 'easeIn' } },
} as const;

const backfaceHidden = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;

/** Face-down card once someone votes; flips over to show the value on reveal. */
function VoteCard({ vote, revealed, revealDelay, cardSet }: { vote: User['vote']; revealed: boolean; revealDelay: number; cardSet: CardSet }) {
  return (
    // Compact: sits beside the name without making the row taller. 2-3 digit values still fit.
    <div style={{ perspective: 600 }} className="h-10 w-8">
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.25, delay: revealed ? revealDelay : 0 }}
      >
        {/* Front: the value. Colour and number are only set after reveal so the
            hidden face never gives the vote away. */}
        <div
          aria-hidden={!revealed}
          style={{ ...backfaceHidden, ...(revealed && vote !== null ? cardStyle(getCardColor(vote, cardSet.cards)) : {}) }}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-400 text-base font-black shadow-md"
        >
          {revealed ? vote : null}
        </div>
        {/* Back: shown while votes are hidden. */}
        <div
          aria-hidden={revealed}
          style={{ ...backfaceHidden, transform: 'rotateY(180deg)' }}
          className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/30 bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md"
        >
          <Check size={14} strokeWidth={3} aria-hidden="true" />
          <span className="sr-only">Voted</span>
        </div>
      </motion.div>
    </div>
  );
}

export function ParticipantCard({ user, isCurrentUser, isObserverSection, revealed, isDarkMode, cardSet, revealDelay = 0, onOpenProfile }: Props) {
  const hasVoted = user.vote !== null;
  const status = isObserverSection ? 'observing' : hasVoted ? 'voted' : 'waiting';

  // Only your own card is interactive; others render as a plain container.
  const Tag: React.ElementType = isCurrentUser ? 'button' : 'div';
  const interactiveProps = isCurrentUser ? { type: 'button' as const, onClick: onOpenProfile } : {};

  return (
    <Tag
      {...interactiveProps}
      className={`flex w-full items-center gap-3 rounded-[1.55rem] px-4 py-3.5 text-left shadow-sm ${isDarkMode ? 'border border-slate-800 bg-slate-950' : 'border border-slate-200 bg-slate-50/70'} ${isCurrentUser ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black uppercase text-blue-600">
        {user.name.slice(0, 1) || '?'}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <p title={user.name} className={`truncate text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {user.name}
          {isCurrentUser && <span className="sr-only"> (you, edit your profile)</span>}
        </p>
      </div>

      {/* Fixed height so swapping badge <-> card doesn't make the row jump. */}
      <div className="flex h-10 shrink-0 items-center justify-end">
        <AnimatePresence mode="popLayout" initial={false}>
          {status === 'voted' ? (
            <motion.div key="voted" {...badgeMotion}>
              <VoteCard vote={user.vote} revealed={revealed} revealDelay={revealDelay} cardSet={cardSet} />
            </motion.div>
          ) : status === 'observing' ? (
            <motion.div key="observing" {...badgeMotion} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
              <Eye size={14} strokeWidth={2.5} />
              Watching
            </motion.div>
          ) : (
            <motion.div key="waiting" {...badgeMotion} className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-600">
              <Clock3 size={14} strokeWidth={2.5} />
              Waiting
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tag>
  );
}
