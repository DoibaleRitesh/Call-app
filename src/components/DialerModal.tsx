import React, { useState, useMemo } from 'react';
import { Phone, Delete, X, User } from 'lucide-react';
import { playDtmfTone } from '../utils/audio';
import { Contact } from '../types';
import { formatIndianPhoneNumber, normalizeIndianPhoneNumber } from '../data/initialData';

interface DialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallNumber: (number: string, contact?: Contact) => void;
  onOpenVault: () => void;
  contacts: Contact[];
  activeSim: string;
  isDark?: boolean;
}

const DIALPAD_KEYS = [
  { key: '1', sub: ' ' },
  { key: '2', sub: 'ABC' },
  { key: '3', sub: 'DEF' },
  { key: '4', sub: 'GHI' },
  { key: '5', sub: 'JKL' },
  { key: '6', sub: 'MNO' },
  { key: '7', sub: 'PQRS' },
  { key: '8', sub: 'TUV' },
  { key: '9', sub: 'WXYZ' },
  { key: '*', sub: ' ' },
  { key: '0', sub: '+' },
  { key: '#', sub: ' ' },
];

export const DialerModal: React.FC<DialerModalProps> = ({
  isOpen,
  onClose,
  onCallNumber,
  onOpenVault,
  contacts,
  activeSim,
  isDark = false,
}) => {
  const [dialedNumber, setDialedNumber] = useState('');

  // Live contact suggestion matching dialed digits (Excluding private contacts!)
  const suggestedContact = useMemo(() => {
    if (!dialedNumber.trim()) return null;
    const clean = normalizeIndianPhoneNumber(dialedNumber);
    if (!clean) return null;
    return (
      contacts
        .filter((c) => !c.isPrivate)
        .find((c) => c.normalizedNumber.includes(clean) || c.phoneNumbers.some((num) => num.includes(dialedNumber))) || null
    );
  }, [dialedNumber, contacts]);

  if (!isOpen) return null;

  const handleKeyPress = (k: string) => {
    playDtmfTone(k);
    const newNum = dialedNumber + k;
    setDialedNumber(newNum);

    // Secret dialer code for Private Vault: #*#*7748*#*# or *#*#82858#*#*
    if (newNum === '#*#*7748*#*#' || newNum === '*#*#82858#*#*' || newNum === '*#*#vault#*#*') {
      setDialedNumber('');
      onClose();
      onOpenVault();
    }
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!dialedNumber) return;
    onCallNumber(dialedNumber, suggestedContact || undefined);
    setDialedNumber('');
    onClose();
  };

  return (
    <div
      id="dialer-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-colors ${
          isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close button & SIM pill */}
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {activeSim.includes('Jio') ? 'SIM 1 (Jio 5G)' : 'SIM 2 (Airtel 5G)'}
          </span>
          <button
            type="button"
            id="close-dialer-btn"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Contact Suggestion preview */}
        <div className="h-10 flex items-center justify-center">
          {suggestedContact ? (
            <button
              type="button"
              id="dialer-suggested-contact"
              onClick={() => {
                onCallNumber(suggestedContact.phoneNumbers[0], suggestedContact);
                setDialedNumber('');
                onClose();
              }}
              className="flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-medium hover:bg-sky-100"
            >
              <User className="w-3.5 h-3.5" />
              <span>{suggestedContact.name}</span>
              <span className="text-[10px] opacity-75">
                ({formatIndianPhoneNumber(suggestedContact.phoneNumbers[0])})
              </span>
            </button>
          ) : dialedNumber.startsWith('#*#*') || dialedNumber.startsWith('*#*#') ? (
            <span className="text-[11px] text-amber-500 font-mono">
              Checking Android engineering & privacy codes...
            </span>
          ) : null}
        </div>

        {/* Dialed Number Display */}
        <div className="flex items-center justify-between px-4 py-3 min-h-[64px]">
          <div className="flex-1 text-center font-normal tracking-wide text-2xl sm:text-3xl select-none truncate">
            {dialedNumber ? formatIndianPhoneNumber(dialedNumber) : (
              <span className="text-zinc-300 dark:text-zinc-600 text-lg">Enter a phone number</span>
            )}
          </div>
          {dialedNumber && (
            <button
              type="button"
              id="dialer-backspace-btn"
              onClick={handleBackspace}
              onContextMenu={(e) => {
                e.preventDefault();
                setDialedNumber('');
              }}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full active:scale-90 transition-transform"
              title="Backspace (long press to clear)"
            >
              <Delete className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Dialpad Matrix */}
        <div className="grid grid-cols-3 gap-y-3 gap-x-6 px-4 py-3">
          {DIALPAD_KEYS.map(({ key, sub }) => (
            <button
              key={key}
              type="button"
              id={`dial-key-${key}`}
              onClick={() => handleKeyPress(key)}
              onContextMenu={(e) => {
                if (key === '0') {
                  e.preventDefault();
                  handleKeyPress('+');
                }
              }}
              className={`flex flex-col items-center justify-center h-16 rounded-full active:scale-95 transition-all select-none ${
                isDark
                  ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 active:bg-zinc-600'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 active:bg-zinc-300'
              }`}
            >
              <span className="text-2xl font-medium leading-none">{key}</span>
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider mt-0.5">
                {sub}
              </span>
            </button>
          ))}
        </div>

        {/* Action Row: Big Green Call Button */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <button
            type="button"
            id="dialer-call-action-btn"
            disabled={!dialedNumber}
            onClick={handleCall}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              dialedNumber
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Phone className="w-7 h-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
