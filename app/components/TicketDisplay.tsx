interface Props {
  ticket: string;
  isHost: boolean;
  onUpdate: (v: string) => void;
  error?: string;
  isDarkMode?: boolean;
}

export const TicketDisplay = ({ ticket, isHost, onUpdate, error = '', isDarkMode = false }: Props) => (
  <div className="w-full max-w-2xl text-center mb-4 sm:mb-6">
    <label className={`mb-2 block text-sm font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Current Ticket</label>
    {isHost ? (
      <div>
        {error && (
          <p className="mb-2 text-left text-sm font-semibold text-rose-500">
            {error}
          </p>
        )}
        <div className={`flex min-h-20 sm:min-h-24 items-center rounded-2xl sm:rounded-4xl border-2 shadow-sm focus-within:border-blue-400 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <input
            type="text"
            className={`w-full bg-transparent px-4 sm:px-6 text-xl sm:text-[2rem] font-black text-center outline-none ${isDarkMode ? 'text-white placeholder:text-slate-600' : 'text-black placeholder:text-slate-300'}`}
            placeholder="Type or paste JIRA title..."
            value={ticket}
            onChange={(e) => onUpdate(e.target.value)}
          />
        </div>
      </div>
    ) : (
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-4xl border shadow-sm min-h-20 sm:min-h-24 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <div className="flex min-h-20 sm:min-h-24 flex-col items-center justify-center">
          <p className={`text-2xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{ticket || "Waiting for Host..."}</p>
        </div>
      </div>
    )}
  </div>
);
