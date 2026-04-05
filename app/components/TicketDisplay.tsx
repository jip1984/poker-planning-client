interface Props { ticket: string; isHost: boolean; onUpdate: (v: string) => void; isDarkMode?: boolean; }

export const TicketDisplay = ({ ticket, isHost, onUpdate, isDarkMode = false }: Props) => (
  <div className="w-full max-w-2xl text-center mb-12">
    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Ticket</label>
    {isHost ? (
      <textarea 
        className={`w-full p-6 rounded-[2rem] border-2 text-[2rem] leading-tight font-black text-center outline-none resize-none shadow-sm focus:border-blue-400 ${isDarkMode ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-black'}`}
        rows={2} placeholder="Type or paste JIRA title..." 
        value={ticket} onChange={(e) => onUpdate(e.target.value)}
      />
    ) : (
      <div className={`p-8 rounded-[2rem] border shadow-sm min-h-[120px] flex items-center justify-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <p className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{ticket || "Waiting for Host..."}</p>
      </div>
    )}
  </div>
);
