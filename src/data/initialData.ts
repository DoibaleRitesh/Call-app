import { Contact, CallRecord, AppSettings } from '../types';

// Zero dummy contacts as strictly mandated: only real device or imported contacts
export const INITIAL_CONTACTS: Contact[] = [];

// Zero dummy call history as strictly mandated: populated only when real calls are placed or received
export const INITIAL_CALL_RECORDS: CallRecord[] = [];

// Initial default settings
export const INITIAL_SETTINGS: AppSettings = {
  isDefaultDialer: true,
  biometricEnabled: true,
  pinEnabled: true,
  pinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // hash of 1234
  pinSalt: 'call_private_salt_2026',
  autoLockMode: 'immediate',
  cnapEnabled: true,
  blockSpamSimulated: false,
  activeSim: 'SIM 1 (Jio 5G)',
};

/**
 * Normalizes Indian phone numbers according to telecom standards:
 * Strips non-digit chars, handles +91, 91, 0 prefixes, retains 10-digit base.
 */
export function normalizeIndianPhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Formats a 10 digit Indian number to "+91 XXXXX XXXXX"
 */
export function formatIndianPhoneNumber(raw: string): string {
  const norm = normalizeIndianPhoneNumber(raw);
  if (norm.length === 10) {
    return `+91 ${norm.slice(0, 5)} ${norm.slice(5)}`;
  }
  return raw;
}

/**
 * Parses exported Google Contacts or Android device vCard (.vcf) file.
 * Preserves 100% offline local privacy with zero backend upload.
 */
export function parseVCard(vcfText: string): Contact[] {
  const contacts: Contact[] = [];
  const cards = vcfText.split(/BEGIN:VCARD/i);

  for (const card of cards) {
    if (!card.trim()) continue;
    let name = '';
    const phoneNumbers: string[] = [];
    const lines = card.split(/\r?\n/);

    for (const line of lines) {
      if (line.startsWith('FN:')) {
        name = line.substring(3).trim();
      } else if (!name && line.startsWith('N:')) {
        const parts = line.substring(2).split(';');
        name = parts.filter(Boolean).reverse().join(' ').trim();
      } else if (line.toUpperCase().startsWith('TEL')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const num = line.substring(colonIdx + 1).trim();
          if (num && !phoneNumbers.includes(num)) {
            phoneNumbers.push(num);
          }
        }
      }
    }

    if (name && phoneNumbers.length > 0) {
      const primary = phoneNumbers[0];
      contacts.push({
        id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        phoneNumbers,
        isFavorite: false,
        isPrivate: false,
        normalizedNumber: normalizeIndianPhoneNumber(primary),
      });
    }
  }

  return contacts;
}

/**
 * Native Android browser Contacts Picker API.
 * Reads real contacts synced to user's Google account or device SIM.
 */
export async function pickDeviceContacts(): Promise<Contact[]> {
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      const raw = await (navigator as any).contacts.select(props, opts);
      return (raw || []).map((item: any, idx: number) => {
        const name = item.name?.[0] || 'Unknown';
        const phoneNumbers = item.tel || [];
        const primary = phoneNumbers[0] || '';
        return {
          id: `device-${Date.now()}-${idx}`,
          name,
          phoneNumbers,
          isFavorite: false,
          isPrivate: false,
          normalizedNumber: normalizeIndianPhoneNumber(primary),
        };
      });
    } catch (err) {
      console.warn('Contacts selection cancelled or unavailable', err);
    }
  }
  return [];
}
