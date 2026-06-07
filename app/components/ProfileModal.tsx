import { ChevronDown } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  isHost: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  editRole: string;
  onEditRoleChange: (role: string) => void;
  error: string;
  onErrorClear: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function ProfileModal({
  isDarkMode,
  isHost,
  editName,
  onEditNameChange,
  editRole,
  onEditRoleChange,
  error,
  onErrorClear,
  onSave,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6 backdrop-blur-sm" onClick={() => { onClose(); onErrorClear(); }}>
      <div className={`w-full max-w-md rounded-[2rem] p-8 shadow-[0_28px_70px_rgba(15,23,42,0.28)] ${isDarkMode ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="mb-6">
          <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h3>
          <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Update the name and role everyone sees in this room.
          </p>
        </div>

        <div className="space-y-4">
          {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          <input
            value={editName}
            onChange={(e) => {
              onEditNameChange(e.target.value);
              if (error) onErrorClear();
            }}
            placeholder="Name"
            className={`h-14 w-full rounded-[1.15rem] px-5 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:border-slate-300'}`}
          />
          {!isHost && (
            <div className="relative">
              <select
                value={editRole}
                onChange={(e) => {
                  onEditRoleChange(e.target.value);
                  if (error) onErrorClear();
                }}
                className={`h-14 w-full appearance-none rounded-[1.15rem] px-5 pr-14 text-base font-medium outline-none transition ${isDarkMode ? 'border border-slate-700 bg-slate-800 focus:border-slate-500' : 'border border-slate-200 bg-slate-50/60 focus:border-slate-300'} ${editRole ? (isDarkMode ? 'text-slate-100' : 'text-slate-700') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
              >
                <option value="" disabled hidden>Select a role</option>
                <option value="Developer">Developer</option>
                <option value="Test">Test</option>
                <option value="Observer">Observer</option>
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-5 flex items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <ChevronDown size={20} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { onClose(); onErrorClear(); }}
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black transition ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-500"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
