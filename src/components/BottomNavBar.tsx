import React from 'react';
import { Star, Clock, Users, Grip } from 'lucide-react';

export type TabType = 'favorites' | 'recents' | 'contacts';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenDialer: () => void;
  isDark?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDialer,
  isDark = false,
}) => {
  return (
    <div className="relative">
      {/* Floating Action Button (Keypad) positioned above bottom nav */}
      <div className="absolute right-5 -top-16 z-30">
        <button
          type="button"
          id="dialpad-fab"
          onClick={onOpenDialer}
          title="Open Dialpad"
          className="w-14 h-14 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white shadow-lg shadow-teal-700/20 flex items-center justify-center transition-all duration-150"
        >
          <Grip className="w-7 h-7" />
        </button>
      </div>

      {/* Material 3 Bottom Navigation Bar */}
      <div
        id="bottom-navigation-bar"
        className={`w-full border-t px-6 py-2 flex items-center justify-around select-none transition-colors ${
          isDark
            ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
            : 'bg-zinc-50/90 border-zinc-200/80 text-zinc-500'
        }`}
      >
        {/* Favorites */}
        <button
          type="button"
          id="tab-favorites"
          onClick={() => onSelectTab('favorites')}
          className="flex flex-col items-center justify-center group focus:outline-none"
        >
          <div
            className={`px-4 py-1 rounded-full transition-all duration-200 ${
              activeTab === 'favorites'
                ? isDark
                  ? 'bg-sky-950/80 text-sky-400 font-semibold'
                  : 'bg-sky-100 text-sky-700 font-semibold'
                : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
            }`}
          >
            <Star
              className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-current' : ''}`}
            />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Favorites</span>
        </button>

        {/* Recents */}
        <button
          type="button"
          id="tab-recents"
          onClick={() => onSelectTab('recents')}
          className="flex flex-col items-center justify-center group focus:outline-none"
        >
          <div
            className={`px-4 py-1 rounded-full transition-all duration-200 ${
              activeTab === 'recents'
                ? isDark
                  ? 'bg-sky-950/80 text-sky-400 font-semibold'
                  : 'bg-sky-100 text-sky-700 font-semibold'
                : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Recents</span>
        </button>

        {/* Contacts */}
        <button
          type="button"
          id="tab-contacts"
          onClick={() => onSelectTab('contacts')}
          className="flex flex-col items-center justify-center group focus:outline-none"
        >
          <div
            className={`px-4 py-1 rounded-full transition-all duration-200 ${
              activeTab === 'contacts'
                ? isDark
                  ? 'bg-sky-950/80 text-sky-400 font-semibold'
                  : 'bg-sky-100 text-sky-700 font-semibold'
                : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Contacts</span>
        </button>
      </div>
    </div>
  );
};
