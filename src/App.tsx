import React, { useState, useEffect } from 'react';
import { Contact, CallRecord, AppSettings, CallerIdResult } from './types';
import {
  INITIAL_CONTACTS,
  INITIAL_CALL_RECORDS,
  INITIAL_SETTINGS,
  formatIndianPhoneNumber,
  normalizeIndianPhoneNumber,
} from './data/initialData';
import { StatusBar } from './components/StatusBar';
import { TopSearchBar } from './components/TopSearchBar';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { ContactsTab } from './components/ContactsTab';
import { RecentsTab } from './components/RecentsTab';
import { FavoritesTab } from './components/FavoritesTab';
import { DialerModal } from './components/DialerModal';
import { PrivateVaultModal } from './components/PrivateVaultModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import { ActiveCallModal } from './components/ActiveCallModal';
import { SettingsModal } from './components/SettingsModal';
import { CodebaseModal } from './components/CodebaseModal';
import { SimulationBar } from './components/SimulationBar';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('call_theme_dark') === 'true';
  });

  // Load purely from local device persistence
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('call_contacts_data');
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem('call_records_data');
      return saved ? JSON.parse(saved) : INITIAL_CALL_RECORDS;
    } catch {
      return INITIAL_CALL_RECORDS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('call_settings_data');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('call_contacts_data', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('call_records_data', JSON.stringify(callRecords));
  }, [callRecords]);

  useEffect(() => {
    localStorage.setItem('call_settings_data', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('call_theme_dark', isDark ? 'true' : 'false');
  }, [isDark]);

  const [activeTab, setActiveTab] = useState<TabType>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodebaseOpen, setIsCodebaseOpen] = useState(false);

  // Auto-lock vault when window or document goes into background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsVaultOpen(false);
      }
    };
    const handleBlur = () => {
      if (settings.autoLockMode === 'immediate') {
        setIsVaultOpen(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [settings.autoLockMode]);

  // Incoming / Active Call state
  const [incomingCall, setIncomingCall] = useState<{
    isOpen: boolean;
    phoneNumber: string;
    callerResult: CallerIdResult;
    isPrivate: boolean;
    contact?: Contact;
  } | null>(null);

  const [activeCall, setActiveCall] = useState<{
    isOpen: boolean;
    phoneNumber: string;
    callerResult: CallerIdResult;
    isPrivate: boolean;
    contact?: Contact;
  } | null>(null);

  // Resolve Indian CNAP Caller ID Priority
  const resolveCallerId = (
    rawNumber: string,
    forceContact?: Contact,
    networkCnapName?: string
  ): CallerIdResult => {
    const normalized = normalizeIndianPhoneNumber(rawNumber);
    const formatted = formatIndianPhoneNumber(rawNumber);

    // PRIORITY 1: Check if number belongs to a Private Contact
    const privateContact =
      forceContact?.isPrivate
        ? forceContact
        : contacts.find((c) => c.isPrivate && c.normalizedNumber === normalized);

    if (privateContact) {
      return {
        displayName: 'Private Contact',
        subtitle: formatted,
        priority: 'PRIVATE',
        isPrivate: true,
        isCnapVerified: false,
      };
    }

    // PRIORITY 2: Check if saved in local device contacts
    const savedContact =
      forceContact || contacts.find((c) => !c.isPrivate && c.normalizedNumber === normalized);

    if (savedContact) {
      return {
        displayName: savedContact.name,
        subtitle: formatted,
        priority: 'SAVED_LOCAL',
        isPrivate: false,
        isCnapVerified: false,
      };
    }

    // PRIORITY 3: Check Indian Telecom CNAP (Calling Name Presentation)
    if (settings.cnapEnabled && networkCnapName?.trim()) {
      return {
        displayName: networkCnapName.trim().toUpperCase(),
        subtitle: `${formatted} • Telecom CNAP Verified`,
        priority: 'CNAP_NETWORK',
        isPrivate: false,
        isCnapVerified: true,
        carrierInfo: 'Telecom Operator Verified',
      };
    }

    // PRIORITY 4: Fallback to raw normalized phone number
    return {
      displayName: formatted,
      subtitle: 'Unknown Caller',
      priority: 'RAW_NUMBER',
      isPrivate: false,
      isCnapVerified: false,
    };
  };

  // Trigger Outgoing Call
  const handleStartCall = (number: string, contact?: Contact) => {
    if (settings.activeSim === 'No SIM' || settings.activeSim === 'No Network') {
      alert(`Cannot make cellular call: ${settings.activeSim}. SIM required.`);
      return;
    }

    const resolved = resolveCallerId(number, contact);
    setActiveCall({
      isOpen: true,
      phoneNumber: number,
      callerResult: resolved,
      isPrivate: resolved.isPrivate,
      contact,
    });
  };

  // End Active Call and log to Normal Recents or Private Call History
  const handleEndCall = (durationSeconds: number) => {
    if (!activeCall) return;

    const newRecord: CallRecord = {
      id: `call-${Date.now()}`,
      contactId: activeCall.contact?.id,
      contactName: activeCall.contact?.name,
      phoneNumber: activeCall.phoneNumber,
      callType: 'outgoing',
      timestamp: Date.now(),
      durationSeconds,
      isPrivate: activeCall.isPrivate,
      simSlot: settings.activeSim.includes('Jio') ? 1 : 2,
    };

    setCallRecords((prev) => [newRecord, ...prev]);
    setActiveCall(null);
  };

  // Simulate Incoming Call scenarios with custom or real inputs
  const handleSimulateIncoming = (
    number: string,
    cnapName?: string,
    contact?: Contact
  ) => {
    const resolved = resolveCallerId(number, contact, cnapName);

    setIncomingCall({
      isOpen: true,
      phoneNumber: number,
      callerResult: resolved,
      isPrivate: resolved.isPrivate,
      contact,
    });
  };

  const handleAnswerIncoming = () => {
    if (!incomingCall) return;
    const callData = incomingCall;
    setIncomingCall(null);
    setActiveCall({
      isOpen: true,
      phoneNumber: callData.phoneNumber,
      callerResult: callData.callerResult,
      isPrivate: callData.isPrivate,
      contact: callData.contact,
    });
  };

  const handleDeclineIncoming = () => {
    if (!incomingCall) return;
    // Log as missed call
    const newRecord: CallRecord = {
      id: `call-${Date.now()}`,
      contactId: incomingCall.contact?.id,
      contactName: incomingCall.contact?.name,
      phoneNumber: incomingCall.phoneNumber,
      callType: 'missed',
      timestamp: Date.now(),
      durationSeconds: 0,
      isPrivate: incomingCall.isPrivate,
      simSlot: 1,
    };
    setCallRecords((prev) => [newRecord, ...prev]);
    setIncomingCall(null);
  };

  // Toggle favorite
  const handleToggleFavorite = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  // Mark / Unmark Private contact
  const handleTogglePrivate = (contactId: string, makePrivate: boolean) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isPrivate: makePrivate } : c))
    );
  };

  // Import batch contacts
  const handleImportContacts = (imported: Contact[]) => {
    setContacts((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newItems = imported.filter((c) => !existingIds.has(c.id));
      return [...newItems, ...prev];
    });
  };

  return (
    <div
      id="app-root-container"
      className={`min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-6 transition-colors font-sans antialiased select-none ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Top Testing & Companion Bar */}
      <SimulationBar
        contacts={contacts}
        onSimulateIncoming={handleSimulateIncoming}
        onSimulateShortcut={() => setIsVaultOpen(true)}
        onOpenCodebase={() => setIsCodebaseOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        activeSim={settings.activeSim}
        onSelectSim={(sim) => setSettings((s) => ({ ...s, activeSim: sim as AppSettings['activeSim'] }))}
      />

      {/* Android Smartphone Device Viewport Mockup */}
      <div
        id="android-phone-frame"
        className={`relative w-full max-w-[420px] h-[830px] rounded-[48px] overflow-hidden flex flex-col shadow-2xl transition-all border-4 sm:border-[8px] ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 ring-1 ring-zinc-700/50 shadow-black/80'
            : 'bg-white border-zinc-800 ring-1 ring-zinc-300 shadow-zinc-400/30'
        }`}
      >
        {/* Top Native Android Status Bar */}
        <StatusBar activeSim={settings.activeSim} isDark={isDark} />

        {/* Top Material 3 Search Bar */}
        <TopSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCodebase={() => setIsCodebaseOpen(true)}
          isDark={isDark}
        />

        {/* Main Content Body */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'favorites' && (
            <FavoritesTab
              contacts={contacts}
              onCallContact={(num, c) => handleStartCall(num, c)}
              isDark={isDark}
            />
          )}

          {activeTab === 'recents' && (
            <RecentsTab
              records={callRecords}
              onCallNumber={(num) => handleStartCall(num)}
              isDark={isDark}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsTab
              contacts={contacts}
              searchQuery={searchQuery}
              onCallContact={(num, c) => handleStartCall(num, c)}
              onToggleFavorite={handleToggleFavorite}
              onTogglePrivate={handleTogglePrivate}
              onImportContacts={handleImportContacts}
              isDark={isDark}
            />
          )}
        </main>

        {/* Native Android Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenDialer={() => setIsDialerOpen(true)}
          isDark={isDark}
        />

        {/* Android Gesture Navigation Bar Pill */}
        <div className="w-full flex justify-center pb-2 pt-1">
          <div className="w-32 h-1 rounded-full bg-zinc-400/60 dark:bg-zinc-600/60" />
        </div>

        {/* DIALER MODAL */}
        <DialerModal
          isOpen={isDialerOpen}
          onClose={() => setIsDialerOpen(false)}
          onCallNumber={(num, c) => handleStartCall(num, c)}
          onOpenVault={() => setIsVaultOpen(true)}
          contacts={contacts}
          activeSim={settings.activeSim}
          isDark={isDark}
        />

        {/* PRIVATE VAULT */}
        <PrivateVaultModal
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
          contacts={contacts}
          callRecords={callRecords}
          settings={settings}
          onCallContact={(num, c) => handleStartCall(num, c)}
          onUnhideContact={(id) => handleTogglePrivate(id, false)}
          isDark={isDark}
        />

        {/* INCOMING CALL FULL-SCREEN INTERFACE */}
        {incomingCall && (
          <IncomingCallModal
            isOpen={incomingCall.isOpen}
            callerNumber={incomingCall.phoneNumber}
            callerResult={incomingCall.callerResult}
            onAnswer={handleAnswerIncoming}
            onDecline={handleDeclineIncoming}
          />
        )}

        {/* ACTIVE IN-CALL SCREEN */}
        {activeCall && (
          <ActiveCallModal
            isOpen={activeCall.isOpen}
            phoneNumber={activeCall.phoneNumber}
            callerResult={activeCall.callerResult}
            onEndCall={handleEndCall}
          />
        )}
      </div>

      {/* SETTINGS & PRIVACY MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(next) => setSettings((s) => ({ ...s, ...next }))}
        isDark={isDark}
      />

      {/* ANDROID STUDIO PROJECT SOURCE CODE & 1-CLICK ZIP EXPORTER */}
      <CodebaseModal
        isOpen={isCodebaseOpen}
        onClose={() => setIsCodebaseOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
