import React, { useState, useMemo, useRef } from 'react';
import { Contact } from '../types';
import { Phone, Star, Shield, X, UserPlus, Upload, Smartphone, Users } from 'lucide-react';
import { formatIndianPhoneNumber, parseVCard, pickDeviceContacts } from '../data/initialData';

interface ContactsTabProps {
  contacts: Contact[];
  searchQuery: string;
  onCallContact: (number: string, contact?: Contact) => void;
  onToggleFavorite: (contactId: string) => void;
  onTogglePrivate: (contactId: string, makePrivate: boolean) => void;
  onImportContacts: (imported: Contact[]) => void;
  isDark?: boolean;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  searchQuery,
  onCallContact,
  onToggleFavorite,
  onTogglePrivate,
  onImportContacts,
  isDark = false,
}) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out private contacts completely from normal contacts screen!
  const visibleContacts = useMemo(() => {
    return contacts
      .filter((c) => !c.isPrivate)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.phoneNumbers.some((num) => num.includes(query)) ||
          c.normalizedNumber.includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchQuery]);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    for (const c of visibleContacts) {
      const letter = (c.name[0] || '#').toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    }
    return map;
  }, [visibleContacts]);

  const alphabet = Object.keys(groupedContacts).sort();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseVCard(content);
        if (parsed.length > 0) {
          onImportContacts(parsed);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePickDevice = async () => {
    const picked = await pickDeviceContacts();
    if (picked.length > 0) {
      onImportContacts(picked);
    }
  };

  const handleAddManualContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    const contact: Contact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      phoneNumbers: [newPhone.trim()],
      isFavorite: false,
      isPrivate: false,
      normalizedNumber: newPhone.replace(/\D/g, ''),
    };
    onImportContacts([contact]);
    setNewName('');
    setNewPhone('');
    setIsAddModalOpen(false);
  };

  return (
    <div className={`relative h-full flex flex-col ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-800'}`}>
      {/* Hidden vCard file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".vcf,text/vcard"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Utility Bar: Import Real Contacts & Add Contact */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-900/60 text-xs">
        <span className="font-semibold text-zinc-500">
          {visibleContacts.length} Contacts
        </span>

        <div className="flex items-center space-x-2">
          {'contacts' in navigator && 'ContactsManager' in window && (
            <button
              type="button"
              onClick={handlePickDevice}
              title="Pick synced Google/Android contacts"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-500" />
              <span>Sync Device</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import Google Contacts (.vcf)"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import .vcf</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-xs"
            title="Add contact"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contact List View */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-thin">
        {visibleContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {searchQuery ? 'No matching contacts' : 'No contacts on device yet'}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
              {searchQuery
                ? 'Try a different search term or phone number.'
                : 'Import your Google Contacts (.vcf) or add your real phone numbers.'}
            </p>

            {!searchQuery && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import .vcf Contacts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New Contact</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          alphabet.map((letter) => (
            <div key={letter} className="mb-4">
              <div
                id={`alphabet-header-${letter}`}
                className={`sticky top-0 z-10 py-1 text-xs font-bold px-1 transition-colors ${
                  isDark ? 'bg-zinc-950 text-sky-400' : 'bg-white text-sky-600'
                }`}
              >
                {letter}
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-900/60">
                {groupedContacts[letter].map((contact) => (
                  <div
                    key={contact.id}
                    id={`contact-item-${contact.id}`}
                    onClick={() => setSelectedContact(contact)}
                    className="flex items-center justify-between py-3 px-1 rounded-xl cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-xs"
                        style={{
                          backgroundColor: getAvatarColor(contact.name),
                        }}
                      >
                        {contact.name[0]?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">
                            {contact.name}
                          </p>
                          {contact.isFavorite && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {contact.phoneNumbers[0] ? formatIndianPhoneNumber(contact.phoneNumbers[0]) : ''}
                        </p>
                      </div>
                    </div>

                    {/* Quick Call Action */}
                    <button
                      type="button"
                      id={`call-btn-${contact.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCallContact(contact.phoneNumbers[0] || contact.normalizedNumber, contact);
                      }}
                      title={`Call ${contact.name}`}
                      className="p-2.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alphabet Fast Jump Strip */}
      {alphabet.length > 0 && (
        <div className="absolute right-1 top-12 bottom-24 flex flex-col justify-center items-center select-none text-[9px] font-semibold text-zinc-400 space-y-0.5">
          {alphabet.map((letter) => (
            <a
              key={letter}
              href={`#alphabet-header-${letter}`}
              className="w-3.5 text-center hover:text-sky-500 hover:scale-125 transition-transform"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Contact Details Sheet / Modal */}
      {selectedContact && (
        <div
          id="contact-detail-sheet"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all ${
              isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contact Details
              </span>
              <button
                type="button"
                id="close-contact-sheet-btn"
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mt-5 mb-4 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-md"
                style={{ backgroundColor: getAvatarColor(selectedContact.name) }}
              >
                {selectedContact.name[0]?.toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
            </div>

            {/* Favorite toggle */}
            <div className="flex justify-center mb-3">
              <button
                type="button"
                onClick={() => onToggleFavorite(selectedContact.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedContact.isFavorite
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${selectedContact.isFavorite ? 'fill-amber-500' : ''}`} />
                <span>{selectedContact.isFavorite ? 'Starred Favorite' : 'Add to Favorites'}</span>
              </button>
            </div>

            {/* Phone Numbers & Call Actions */}
            <div className="space-y-2.5 my-4">
              {selectedContact.phoneNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl ${
                    isDark ? 'bg-zinc-950/80' : 'bg-zinc-50'
                  }`}
                >
                  <div>
                    <p className="text-xs text-zinc-400">Mobile {idx + 1}</p>
                    <p className="text-sm font-semibold tracking-wide">
                      {formatIndianPhoneNumber(num)}
                    </p>
                  </div>
                  <button
                    type="button"
                    id={`sheet-call-btn-${idx}`}
                    onClick={() => {
                      onCallContact(num, selectedContact);
                      setSelectedContact(null);
                    }}
                    className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>

            {/* Privacy Shield Control (Mark / Unmark as Private) */}
            <div
              className={`p-3.5 rounded-2xl mt-4 border transition-colors ${
                selectedContact.isPrivate
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                  : isDark
                  ? 'bg-zinc-950/40 border-zinc-800'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      selectedContact.isPrivate
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      {selectedContact.isPrivate ? 'Private Contact (Hidden)' : 'Mark as Private'}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      Hides from normal lists & incoming caller ID
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="toggle-private-btn"
                  onClick={() => {
                    const nextState = !selectedContact.isPrivate;
                    onTogglePrivate(selectedContact.id, nextState);
                    setSelectedContact(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedContact.isPrivate
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                  }`}
                >
                  {selectedContact.isPrivate ? 'Unhide' : 'Hide Now'}
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2.5 leading-relaxed">
                The original contact remains 100% untouched in your phone&apos;s ContactsContract. Only Call&apos;s local database holds the privacy flag.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Contact Creation Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-colors ${
              isDark ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800' : 'bg-white text-zinc-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold">Add New Contact</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualContact} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98201 23456"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function getAvatarColor(name: string): string {
  const colors = [
    '#0284c7', // Sky
    '#059669', // Emerald
    '#7c3aed', // Violet
    '#db2777', // Pink
    '#ea580c', // Orange
    '#4f46e5', // Indigo
    '#0891b2', // Cyan
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
