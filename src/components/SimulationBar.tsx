import React, { useState } from 'react';
import { Contact } from '../types';
import { PhoneIncoming, Shield, Download, Sun, Moon, Zap, Radio, X } from 'lucide-react';

interface SimulationBarProps {
  contacts: Contact[];
  onSimulateIncoming: (number: string, cnapName?: string, contact?: Contact) => void;
  onSimulateShortcut: () => void;
  onOpenCodebase: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeSim: string;
  onSelectSim: (sim: string) => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  contacts,
  onSimulateIncoming,
  onSimulateShortcut,
  onOpenCodebase,
  isDark,
  onToggleTheme,
  activeSim,
  onSelectSim,
}) => {
  const [isTestCallModalOpen, setIsTestCallModalOpen] = useState(false);
  const [testNumber, setTestNumber] = useState('+91 98201 23456');
  const [testCnap, setTestCnap] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  const handleLaunchCall = () => {
    let contact: Contact | undefined;
    if (selectedContactId) {
      contact = contacts.find((c) => c.id === selectedContactId);
    }
    const num = contact ? contact.phoneNumbers[0] : testNumber;
    onSimulateIncoming(num, testCnap || undefined, contact);
    setIsTestCallModalOpen(false);
  };

  return (
    <header
      id="simulation-companion-bar"
      className="w-full max-w-4xl mx-auto mb-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      {/* Left: App Identity & Status */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
          C
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Call</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              India CNAP Active
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">100% Offline Android Cellular Calling</p>
        </div>
      </div>

      {/* Center: Live Telephony & CNAP Testing Controls */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          type="button"
          id="open-test-call-dialog"
          onClick={() => setIsTestCallModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center space-x-1.5 transition-colors border border-emerald-200 dark:border-emerald-800/60"
        >
          <PhoneIncoming className="w-3.5 h-3.5" />
          <span>Test Incoming Call...</span>
        </button>

        {/* Shortcut Launcher Simulator */}
        <button
          type="button"
          id="simulate-shortcut-btn"
          onClick={onSimulateShortcut}
          title="Simulate Android ShortcutManager: Launches directly into Biometric Vault"
          className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium flex items-center space-x-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Vault Shortcut</span>
        </button>

        {/* SIM Slot Switcher */}
        <select
          id="sim-selector"
          value={activeSim}
          onChange={(e) => onSelectSim(e.target.value)}
          className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-none focus:outline-none cursor-pointer"
        >
          <option value="SIM 1 (Jio 5G)">SIM 1: Jio 5G</option>
          <option value="SIM 2 (Airtel 5G)">SIM 2: Airtel 5G</option>
          <option value="No SIM">No SIM</option>
          <option value="No Network">No Network</option>
        </select>
      </div>

      {/* Right: Codebase Exporter & Theme Toggle */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          id="open-codebase-bar-btn"
          onClick={onOpenCodebase}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Android Studio ZIP</span>
        </button>

        <button
          type="button"
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Test Incoming Call Configurator Dialog */}
      {isTestCallModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsTestCallModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-colors ${
              isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <PhoneIncoming className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold">Test Incoming Call & CNAP</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestCallModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {contacts.length > 0 && (
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">
                    Test Against Real Contact
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <option value="">-- Custom Phone Number --</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isPrivate ? '(Private Vault)' : '(Saved)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedContactId && (
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Incoming Phone Number</label>
                  <input
                    type="tel"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="+91 98201 23456"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">
                  Telecom CNAP Network Presentation (Optional)
                </label>
                <input
                  type="text"
                  value={testCnap}
                  onChange={(e) => setTestCnap(e.target.value)}
                  placeholder="e.g. RELIANCE JIO or AIRTEL MUMBAI"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Tests Priority 3: Only used if not saved locally or marked private.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTestCallModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunchCall}
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Trigger Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
