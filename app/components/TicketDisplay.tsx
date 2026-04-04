interface Props { ticket: string; isHost: boolean; onUpdate: (v: string) => void; }

export const TicketDisplay = ({ ticket, isHost, onUpdate }: Props) => (
  <div className="w-full max-w-2xl text-center mb-12">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Current Ticket</label>
    {isHost ? (
      <textarea 
        className="w-full p-6 bg-white rounded-[2rem] border-2 border-slate-200 text-[2rem] leading-tight font-black text-black text-center focus:border-blue-400 outline-none resize-none shadow-sm"
        rows={2} placeholder="Type or paste JIRA title..." 
        value={ticket} onChange={(e) => onUpdate(e.target.value)}
      />
    ) : (
      <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[120px] flex items-center justify-center">
        <p className="text-2xl font-bold text-slate-700">{ticket || "Waiting for Host..."}</p>
      </div>
    )}
  </div>
);
