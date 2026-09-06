import React from 'react';
import { AppSettings, AutoLockMode } from '../types';
import {
  Shield,
  Smartphone,
  Fingerprint,
  KeyRound,
  Timer,
  EyeOff,
  Radio,
  FileCheck,
  Info,
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (next: Partial<AppSettings>) => void;
  isDark?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isDark = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-colors ${
          isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-semibold">Settings & Privacy</h2>
          </div>
          <button
            type="button"
            id="close-settings-btn"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 divide-y divide-zinc-100 dark:divide-zinc-800/80 pr-1">
          {/* SECTION 1: Default Phone App */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Default Phone App
            </h3>

            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                settings.isDefaultDialer
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {settings.isDefaultDialer ? 'Call is Default Dialer' : 'Set as Default Phone App'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                    Required for InCallService incoming caller shielding & telecom CNAP resolution.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-default-dialer-btn"
                onClick={() => onUpdateSettings({ isDefaultDialer: !settings.isDefaultDialer })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  settings.isDefaultDialer
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300'
                }`}
              >
                {settings.isDefaultDialer ? 'Active' : 'Set Default'}
              </button>
            </div>
          </div>

          {/* SECTION 2: Privacy & Security */}
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Privacy & Security
            </h3>

            {/* Biometric Lock Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-sm font-medium">Biometric Unlock</p>
                  <p className="text-xs text-zinc-400">Fingerprint authentication via Android Keystore</p>
                </div>
              </div>
              <input
                id="biometric-lock-toggle"
                type="checkbox"
                checked={settings.biometricEnabled}
                onChange={(e) => onUpdateSettings({ biometricEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

            {/* PIN Lock */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">PIN Backup</p>
                  <p className="text-xs text-zinc-400">4-digit salted hash fallback (Default: 1234)</p>
                </div>
              </div>
              <input
                id="pin-lock-toggle"
                type="checkbox"
                checked={settings.pinEnabled}
                onChange={(e) => onUpdateSettings({ pinEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto Lock Mode */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">Auto-Lock Vault</p>
                  <p className="text-xs text-zinc-400">When app enters background</p>
                </div>
              </div>

              <select
                id="auto-lock-mode-select"
                value={settings.autoLockMode}
                onChange={(e) => onUpdateSettings({ autoLockMode: e.target.value as AutoLockMode })}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="immediate">Immediately</option>
                <option value="1min">After 1 minute</option>
                <option value="5min">After 5 minutes</option>
              </select>
            </div>

            {/* FLAG_SECURE Preview Notice */}
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 flex items-start space-x-2.5">
              <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <strong className="font-semibold text-zinc-700 dark:text-zinc-300">FLAG_SECURE is enforced:</strong> Android system screenshots and app switcher preview thumbnails are blocked from capturing private records.
              </p>
            </div>
          </div>

          {/* SECTION 3: Indian Telecom CNAP */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Indian Telecom CNAP
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                TRAI Standard
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Calling Name Presentation</p>
                  <p className="text-xs text-zinc-400">
                    Carrier network-provided caller ID (Airtel, Jio, Vi, BSNL)
                  </p>
                </div>
              </div>
              <input
                id="cnap-toggle"
                type="checkbox"
                checked={settings.cnapEnabled}
                onChange={(e) => onUpdateSettings({ cnapEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs space-y-1.5">
              <p className="font-semibold text-xs flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                Caller Identification Priority Order:
              </p>
              <ol className="list-decimal pl-5 text-[11px] space-y-0.5 text-blue-800 dark:text-blue-300">
                <li><strong>Private Contact:</strong> Shows strictly &quot;Private Contact&quot; (conceals real name)</li>
                <li><strong>Local Contact:</strong> Shows saved contact name</li>
                <li><strong>Telecom CNAP:</strong> Shows carrier-verified name</li>
                <li><strong>Fallback:</strong> Shows raw normalized phone number</li>
              </ol>
            </div>
          </div>

          {/* SECTION 4: Permissions */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Required Android Permissions
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span>READ_CONTACTS</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Granted</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>CALL_PHONE</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Granted</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>READ_CALL_LOG</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Granted</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>READ_PHONE_STATE</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Granted</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: About & Privacy Guarantees */}
          <div className="pt-4 space-y-2 text-center">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Call (PrivateCall India) • v1.0.0
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
              100% Offline • Zero Analytics • Zero Cloud Databases • No Accounts • Trai CNAP Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
