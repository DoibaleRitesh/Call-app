import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  activeSim: string;
  isDark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeSim, isDark = false }) => {
  const [currentTime, setCurrentTime] = useState('10:42');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const hasNetwork = activeSim !== 'No Network' && activeSim !== 'No SIM';

  return (
    <div
      id="android-status-bar"
      className={`w-full px-5 pt-3 pb-1 flex items-center justify-between text-xs select-none transition-colors ${
        isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-white text-zinc-700'
      }`}
    >
      {/* Time & Indian carrier indicator */}
      <div className="flex items-center space-x-2 font-medium">
        <span>{currentTime}</span>
        {hasNetwork && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300">
            {activeSim.includes('Jio') ? 'Jio 5G' : 'Airtel 5G'}
          </span>
        )}
      </div>

      {/* Notch / Punch hole indicator */}
      <div className="w-3.5 h-3.5 rounded-full bg-black/80 ring-2 ring-zinc-800/30" />

      {/* Status Icons */}
      <div className="flex items-center space-x-2">
        {hasNetwork ? (
          <div className="flex items-center space-x-0.5" title="VoLTE Cellular Signal">
            <span className="text-[10px] font-bold tracking-tighter">VoLTE</span>
            <div className="flex items-end space-x-[1.5px] h-3 ml-0.5">
              <span className="w-0.5 h-1 bg-current rounded-full" />
              <span className="w-0.5 h-1.5 bg-current rounded-full" />
              <span className="w-0.5 h-2 bg-current rounded-full" />
              <span className="w-0.5 h-2.5 bg-current rounded-full" />
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-red-500 font-semibold">
            {activeSim === 'No SIM' ? 'No SIM' : 'Emergency only'}
          </span>
        )}
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-semibold">89%</span>
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>
    </div>
  );
};
