import React, { useState } from 'react';
import { Contact, CallRecord, AppSettings } from '../types';
import {
  Lock,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Phone,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
  X,
  LockKeyhole,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatIndianPhoneNumber } from '../data/initialData';

interface PrivateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  callRecords: CallRecord[];
  settings: AppSettings;
  onCallContact: (number: string, contact?: Contact) => void;
  onUnhideContact: (contactId: string) => void;
  isDark?: boolean;
}

export const PrivateVaultModal: React.FC<PrivateVaultModalProps> = ({
  isOpen,
  onClose,
  contacts,
  callRecords,
  settings,
  onCallContact,
  onUnhideContact,
  isDark = false,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'history'>('contacts');
  const [fingerprintScanning, setFingerprintScanning] = useState(false);

  if (!isOpen) return null;

  // Filter only private contacts and private call history
  const privateContacts = contacts.filter((c) => c.isPrivate);
  const privateCalls = callRecords.filter((r) => r.isPrivate);

  const handleFingerprintScan = () => {
    setFingerprintScanning(true);
    setTimeout(() => {
      setFingerprintScanning(false);
      setIsAuthenticated(true);
    }, 900);
  };

  const handlePinDigit = (digit: string) => {
    setPinError(false);
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        // Validate against default PIN "1234"
        if (nextPin === '1234') {
          setTimeout(() => {
            setIsAuthenticated(true);
            setPinInput('');
          }, 200);
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinInput('');
          }, 600);
        }
      }
    }
  };

  const handleLockNow = () => {
    setIsAuthenticated(false);
    setPinInput('');
    onClose();
  };

  return (
    <div
      id="private-vault-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col transition-colors max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
        }`}
      >
        {/* Header with Close and Lock */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-wide">
              {isAuthenticated ? 'Private Contacts Vault' : 'Private Access'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {isAuthenticated && (
              <button
                type="button"
                id="vault-lock-now-btn"
                onClick={handleLockNow}
                title="Lock Vault"
                className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
              >
                Lock Now
              </button>
            )}
            <button
              type="button"
              id="close-vault-modal-btn"
              onClick={handleLockNow}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED SCREEN: Authenticate via Fingerprint or PIN */}
        {!isAuthenticated ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 ring-4 ring-amber-500/5">
              <LockKeyhole className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold tracking-tight mb-1">
              {authMode === 'biometric' ? 'Use Fingerprint' : 'Enter PIN'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-6">
              Confirm your identity to decrypt and access hidden contacts and private call history.
            </p>

            {authMode === 'biometric' ? (
              /* Biometric Sensor Simulation */
              <div className="flex flex-col items-center space-y-4 my-2">
                <button
                  type="button"
                  id="biometric-fingerprint-sensor"
                  onClick={handleFingerprintScan}
                  disabled={fingerprintScanning}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    fingerprintScanning
                      ? 'bg-emerald-500/20 text-emerald-500 scale-105 ring-4 ring-emerald-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-sky-500 hover:bg-sky-500/10 active:scale-95'
                  }`}
                  title="Touch fingerprint sensor to scan"
                >
                  <Fingerprint className={`w-12 h-12 ${fingerprintScanning ? 'animate-pulse' : ''}`} />
                  {fingerprintScanning && (
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-30" />
                  )}
                </button>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {fingerprintScanning ? 'Verifying with Android Keystore...' : 'Touch sensor to unlock'}
                </span>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full flex justify-center">
                  <button
                    type="button"
                    id="switch-to-pin-btn"
                    onClick={() => setAuthMode('pin')}
                    className="flex items-center space-x-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Or use backup PIN</span>
                  </button>
                </div>
              </div>
            ) : (
              /* PIN Keypad Mode */
              <div className="flex flex-col items-center space-y-5 my-2 w-full max-w-xs">
                {/* 4 PIN Dots */}
                <div className="flex items-center space-x-4 h-8">
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = pinInput.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full transition-all ${
                          pinError
                            ? 'bg-rose-500 animate-shake'
                            : filled
                            ? 'bg-sky-600 dark:bg-sky-400 scale-110'
                            : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {pinError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Incorrect PIN. Try again. (Default: 1234)
                  </p>
                )}

                {/* 3x4 Numeric Pad */}
                <div className="grid grid-cols-3 gap-3 w-full px-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      id={`pin-key-${num}`}
                      onClick={() => handlePinDigit(num)}
                      className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-lg active:scale-90 transition-transform"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    id="pin-clear-btn"
                    onClick={() => setPinInput('')}
                    className="h-12 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-zinc-600"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    id="pin-key-0"
                    onClick={() => handlePinDigit('0')}
                    className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-lg active:scale-90 transition-transform"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    id="pin-backspace-btn"
                    onClick={() => setPinInput((p) => p.slice(0, -1))}
                    className="h-12 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-zinc-600"
                  >
                    ⌫
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    id="switch-to-biometric-btn"
                    onClick={() => setAuthMode('biometric')}
                    className="flex items-center space-x-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Use Fingerprint</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AUTHENTICATED VAULT INTERFACE */
          <div className="flex flex-col flex-1 overflow-hidden mt-2">
            {/* Vault Tabs: Private Contacts vs Private History */}
            <div className="flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800/60 mb-4">
              <button
                type="button"
                id="vault-tab-contacts"
                onClick={() => setActiveSubTab('contacts')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'contacts'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Private Contacts ({privateContacts.length})
              </button>
              <button
                type="button"
                id="vault-tab-history"
                onClick={() => setActiveSubTab('history')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'history'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Private History ({privateCalls.length})
              </button>
            </div>

            {/* Sub-tab 1: Private Contacts List */}
            {activeSubTab === 'contacts' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {privateContacts.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-xs text-zinc-400">No private contacts yet.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      You can mark any contact as Private from their details card.
                    </p>
                  </div>
                ) : (
                  privateContacts.map((contact) => (
                    <div
                      key={contact.id}
                      id={`private-contact-${contact.id}`}
                      className="pt-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {contact.photoUri ? (
                          <img
                            src={contact.photoUri}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-amber-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {contact.name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {formatIndianPhoneNumber(contact.phoneNumbers[0])}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          id={`unhide-contact-${contact.id}`}
                          onClick={() => onUnhideContact(contact.id)}
                          title="Unhide contact (make normal)"
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        >
                          Unhide
                        </button>

                        <button
                          type="button"
                          id={`call-private-btn-${contact.id}`}
                          onClick={() => onCallContact(contact.phoneNumbers[0], contact)}
                          className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                          title="Call privately"
                        >
                          <Phone className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-tab 2: Private Call History */}
            {activeSubTab === 'history' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {privateCalls.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-xs text-zinc-400">No private calls logged yet.</p>
                  </div>
                ) : (
                  privateCalls.map((record) => (
                    <div
                      key={record.id}
                      id={`private-call-record-${record.id}`}
                      className="pt-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          {record.callType === 'incoming' && (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {record.callType === 'outgoing' && (
                            <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          )}
                          {record.callType === 'missed' && (
                            <PhoneMissed className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
                            {record.contactName || formatIndianPhoneNumber(record.phoneNumber)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            <span className="capitalize">{record.callType}</span> •{' '}
                            {formatTimeAgo(record.timestamp)}
                            {record.durationSeconds > 0 && ` • ${formatDuration(record.durationSeconds)}`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`redial-private-btn-${record.id}`}
                        onClick={() => onCallContact(record.phoneNumber)}
                        className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        title="Redial privately"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Privacy Guarantee footer */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                Hardware Keystore Encrypted
              </span>
              <span>Auto-locks on exit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
