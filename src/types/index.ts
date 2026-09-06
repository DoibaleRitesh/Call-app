export type CallType = 'incoming' | 'outgoing' | 'missed' | 'rejected';

export interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
  photoUri?: string;
  isFavorite?: boolean;
  isPrivate?: boolean;
  company?: string;
  normalizedNumber: string;
}

export interface CallRecord {
  id: string;
  contactId?: string;
  contactName?: string;
  phoneNumber: string;
  callType: CallType;
  timestamp: number;
  durationSeconds: number;
  isPrivate: boolean;
  simSlot?: number;
}

export type AutoLockMode = 'immediate' | '1min' | '5min';

export interface AppSettings {
  isDefaultDialer: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pinHash: string; // Salted SHA-256 hash
  pinSalt: string;
  autoLockMode: AutoLockMode;
  cnapEnabled: boolean;
  blockSpamSimulated: boolean;
  activeSim: 'SIM 1 (Jio 5G)' | 'SIM 2 (Airtel 5G)' | 'No SIM' | 'No Network';
}

export type CallerIdPriority = 'PRIVATE' | 'SAVED_LOCAL' | 'CNAP_NETWORK' | 'RAW_NUMBER';

export interface CallerIdResult {
  displayName: string;
  subtitle: string;
  priority: CallerIdPriority;
  isPrivate: boolean;
  isCnapVerified: boolean;
  carrierInfo?: string;
}

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'json';
  category: 'manifest' | 'gradle' | 'room' | 'domain' | 'telephony' | 'security' | 'ui' | 'test' | 'docs';
  content: string;
}
