import { motion } from 'motion/react';

interface Props {
  /** Seconds to wait before flipping in. */
  delay?: number;
  children: React.ReactNode;
}

/** Flips its child into view around the vertical axis, like a card being turned over. */
export function FlipIn({ delay = 0, children }: Props) {
  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{
          rotateY: { type: 'spring', duration: 0.6, bounce: 0.3, delay },
          opacity: { duration: 0.15, delay },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Fades and lifts its child into view. */
export function RiseIn({ delay = 0, className, children }: Props & { className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
