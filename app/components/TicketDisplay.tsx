interface Props {
  ticket: string;
  isHost: boolean;
  onUpdate: (v: string) => void;
  error?: string;
  isDarkMode?: boolean;
}

export const TicketDisplay = ({ ticket, isHost, onUpdate, error = '', isDarkMode = false }: Props) => (
  <div className="w-full max-w-2xl text-center mb-12">
    <label className={`mb-3 block text-sm font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Current Ticket</label>
    {isHost ? (
      <div>
        {error && (
          <p className="mb-3 text-left text-sm font-semibold text-rose-500">
            {error}
          </p>
        )}
        <textarea 
          className={`w-full p-6 rounded-[2rem] border-2 text-[2rem] leading-tight font-black text-center outline-none resize-none shadow-sm focus:border-blue-400 ${isDarkMode ? 'border-slate-700 bg-slate-900 text-white placeholder:text-white' : 'border-slate-200 bg-white text-black placeholder:text-slate-300'}`}
          rows={2} placeholder="Type or paste JIRA title..." 
          value={ticket} onChange={(e) => onUpdate(e.target.value)}
        />
      </div>
    ) : (
      <div className={`p-8 rounded-[2rem] border shadow-sm min-h-[120px] ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <div className="flex min-h-[120px] flex-col items-center justify-center">
          <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{ticket || "Waiting for Host..."}</p>
        </div>
      </div>
    )}
  </div>
);
