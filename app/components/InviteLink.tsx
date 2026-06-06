interface Props {
  inviteLink: string;
  isDarkMode: boolean;
  copyStatus: 'idle' | 'copied';
  onCopy: () => void;
}

export function InviteLink({ inviteLink, isDarkMode, copyStatus, onCopy }: Props) {
  return (
    <div className={`flex w-96 items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`}>
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Invite Link</span>
      <p className={`min-w-0 flex-1 truncate text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {inviteLink}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition ${
          copyStatus === 'copied'
            ? 'bg-emerald-500 text-white hover:bg-emerald-500'
            : isDarkMode
            ? 'bg-slate-100 text-slate-950 hover:bg-white'
            : 'bg-black text-white hover:bg-slate-900'
        }`}
      >
        {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
