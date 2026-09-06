import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MoreVertical, Shield, Settings, History, Code2, Lock } from 'lucide-react';

interface TopSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
  onOpenCodebase: () => void;
  isDark?: boolean;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenVault,
  onOpenSettings,
  onOpenCodebase,
  isDark = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`px-4 pt-2 pb-2 relative ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
      <div
        id="phone-search-bar"
        className={`flex items-center w-full px-3.5 py-2.5 rounded-full transition-shadow duration-200 ${
          isDark
            ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800 focus-within:ring-sky-500 shadow-sm'
            : 'bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200/80 focus-within:ring-sky-500 focus-within:bg-white shadow-xs'
        }`}
      >
        <Search className={`w-4 h-4 mr-2.5 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
        <input
          id="search-contacts-input"
          type="text"
          placeholder="Search contacts & places"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-400 font-normal"
        />

        <div className="flex items-center space-x-1 shrink-0 ml-1">
          <button
            type="button"
            id="search-voice-mic-btn"
            title="Voice search"
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              id="overflow-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title="More options"
              className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                id="overflow-dropdown-menu"
                className={`absolute right-0 top-full mt-1.5 w-56 rounded-2xl py-2 shadow-xl ring-1 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-zinc-900 ring-zinc-800 text-zinc-200'
                    : 'bg-white ring-zinc-200 text-zinc-800'
                }`}
              >
                <button
                  id="menu-settings-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2.5 flex items-center text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                >
                  <Settings className="w-4 h-4 mr-3 text-zinc-500" />
                  Settings
                </button>

                <button
                  id="menu-private-vault-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenVault();
                  }}
                  className="w-full px-4 py-2.5 flex items-center text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-amber-600 dark:text-amber-400"
                >
                  <Lock className="w-4 h-4 mr-3 text-amber-500" />
                  <span>Private Vault</span>
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                    PIN
                  </span>
                </button>

                <button
                  id="menu-codebase-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCodebase();
                  }}
                  className="w-full px-4 py-2.5 flex items-center text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-sky-600 dark:text-sky-400"
                >
                  <Code2 className="w-4 h-4 mr-3 text-sky-500" />
                  Android Project Source (.ZIP)
                </button>

                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                <div className="px-4 py-1.5 flex items-center text-[11px] text-zinc-400">
                  <Shield className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                  <span>100% Offline • India CNAP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
