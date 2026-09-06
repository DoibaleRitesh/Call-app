import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Shield, ShieldCheck, User } from 'lucide-react';
import { CallerIdResult, Contact } from '../types';
import { playRingtone } from '../utils/audio';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerNumber: string;
  callerResult: CallerIdResult;
  onAnswer: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerNumber,
  callerResult,
  onAnswer,
  onDecline,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const stopRing = playRingtone();
    return () => {
      stopRing();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="incoming-call-screen"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white p-8 animate-in fade-in zoom-in-95 duration-200 select-none"
    >
      {/* Top Header / CNAP Badge */}
      <div className="pt-6 flex flex-col items-center text-center">
        {callerResult.isPrivate ? (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold ring-1 ring-amber-500/40">
            <Shield className="w-3.5 h-3.5" />
            <span>Private Caller Shield Active</span>
          </div>
        ) : callerResult.isCnapVerified ? (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold ring-1 ring-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>India Telecom CNAP Verified</span>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 font-medium tracking-wide">
            INCOMING CALL • SIM 1 (Jio 5G)
          </div>
        )}
      </div>

      {/* Center Caller Info with Indian Telecom Priority */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-zinc-800 ring-4 ring-zinc-700/50 flex items-center justify-center text-zinc-300 shadow-2xl">
            <User className="w-14 h-14" />
          </div>
          {/* Animated pulse rings */}
          <div className="absolute inset-0 rounded-full border border-sky-500/40 animate-ping" />
        </div>

        {/* Display Name:
            1. Private Contact -> Strictly "Private Contact" (Conceals real name!)
            2. Saved Contact -> Saved Name
            3. Telecom CNAP -> CNAP Name
            4. Fallback -> Formatted Phone Number
        */}
        <h2
          id="incoming-caller-name"
          className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
            callerResult.isPrivate ? 'text-amber-400' : 'text-white'
          }`}
        >
          {callerResult.displayName}
        </h2>

        <p id="incoming-caller-subtitle" className="text-sm text-zinc-400 font-medium">
          {callerResult.subtitle}
        </p>

        {callerResult.isPrivate && (
          <p className="text-[11px] text-amber-500/90 mt-2 max-w-xs leading-tight">
            Contact name hidden by PrivateCall vault policy until authentication.
          </p>
        )}
      </div>

      {/* Answer & Decline Actions */}
      <div className="pb-8 w-full max-w-xs mx-auto">
        <div className="flex items-center justify-around">
          {/* Decline Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              id="decline-call-btn"
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-xs font-semibold text-zinc-300">Decline</span>
          </div>

          {/* Answer Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              id="answer-call-btn"
              onClick={onAnswer}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform"
            >
              <Phone className="w-7 h-7 fill-current" />
            </button>
            <span className="text-xs font-semibold text-zinc-300">Answer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
