import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Grip, User, Shield } from 'lucide-react';
import { CallerIdResult, Contact } from '../types';
import { formatIndianPhoneNumber } from '../data/initialData';

interface ActiveCallModalProps {
  isOpen: boolean;
  phoneNumber: string;
  callerResult: CallerIdResult;
  onEndCall: (durationSeconds: number) => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  isOpen,
  phoneNumber,
  callerResult,
  onEndCall,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="active-call-screen"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white p-8 animate-in fade-in duration-200 select-none"
    >
      {/* Top Bar with Call Status & Timer */}
      <div className="pt-6 flex flex-col items-center text-center">
        {callerResult.isPrivate ? (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold ring-1 ring-amber-500/40 mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Private Call Session</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase mb-3">
            Cellular Call • HD Voice
          </span>
        )}

        <h2 className="text-2xl font-bold tracking-tight mb-1">
          {callerResult.displayName}
        </h2>
        <p className="text-sm text-zinc-400 mb-3">
          {formatIndianPhoneNumber(phoneNumber)}
        </p>
        <div className="text-sm font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
          {formatTimer(seconds)}
        </div>
      </div>

      {/* In-Call Controls Matrix */}
      <div className="my-auto w-full max-w-xs mx-auto grid grid-cols-3 gap-6 py-6">
        {/* Mute */}
        <button
          type="button"
          id="incall-mute-btn"
          onClick={() => setIsMuted(!isMuted)}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${
            isMuted ? 'bg-white text-zinc-900' : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-[11px] font-medium mt-1.5">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* Keypad */}
        <button
          type="button"
          id="incall-keypad-btn"
          className="flex flex-col items-center justify-center p-4 rounded-3xl bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all"
        >
          <Grip className="w-6 h-6" />
          <span className="text-[11px] font-medium mt-1.5">Keypad</span>
        </button>

        {/* Speaker */}
        <button
          type="button"
          id="incall-speaker-btn"
          onClick={() => setIsSpeaker(!isSpeaker)}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${
            isSpeaker ? 'bg-white text-zinc-900' : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
          }`}
        >
          {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          <span className="text-[11px] font-medium mt-1.5">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
        </button>
      </div>

      {/* End Call Button */}
      <div className="pb-8 flex justify-center">
        <button
          type="button"
          id="end-call-btn"
          onClick={() => onEndCall(seconds)}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-transform"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
