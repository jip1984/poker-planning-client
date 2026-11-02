import Link from 'next/link';

interface Props {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: Props) {
  const linkClass = `rounded-md px-1 py-2 transition hover:underline underline-offset-4 ${isDarkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'}`;
  const separator = (
    <span aria-hidden="true" className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}>
      ·
    </span>
  );

  return (
    <footer className={`w-full pb-6 pt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
      <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span className="py-2">© {new Date().getFullYear()} Planning Poker</span>
        {separator}
        <Link href="/terms" className={linkClass}>
          Terms of Service
        </Link>
        {separator}
        <Link href="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
}
