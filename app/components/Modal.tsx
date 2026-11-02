'use client';
import { ReactNode, useEffect, useRef } from 'react';

interface Props {
  /** id of the heading inside the modal, announced as the dialog's name. */
  titleId: string;
  onClose: () => void;
  /** Tailwind max-width class for the dialog, e.g. "max-w-md". */
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Accessible modal built on the native <dialog> element:
 * Escape closes it, focus moves inside and stays there, focus returns to the
 * previously focused element on close, and clicking the backdrop closes it.
 */
export function Modal({ titleId, onClose, maxWidth = 'max-w-md', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.close();
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape key: let React state drive closing instead of the browser.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click whose target is the <dialog> itself landed on the backdrop.
        if (e.target === e.currentTarget) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-3rem)] ${maxWidth} overflow-visible border-0 bg-transparent p-0 text-inherit backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm`}
    >
      {children}
    </dialog>
  );
}
