import Link from 'next/link';

interface Props {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: Props) {
  return (
    <footer className={`absolute bottom-6 left-0 right-0 text-center text-xs font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
      © {new Date().getFullYear()} Planning Poker
      <span className="mx-2">·</span>
      <Link href="/terms" className={`transition hover:underline ${isDarkMode ? 'hover:text-slate-400' : 'hover:text-slate-600'}`}>
        Terms of Service
      </Link>
      <span className="mx-2">·</span>
      <Link href="/privacy" className={`transition hover:underline ${isDarkMode ? 'hover:text-slate-400' : 'hover:text-slate-600'}`}>
        Privacy Policy
      </Link>
    </footer>
  );
}
