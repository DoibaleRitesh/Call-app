import React from 'react';
import { Contact } from '../types';
import { Phone, Star } from 'lucide-react';
import { formatIndianPhoneNumber } from '../data/initialData';

interface FavoritesTabProps {
  contacts: Contact[];
  onCallContact: (number: string, contact?: Contact) => void;
  isDark?: boolean;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  contacts,
  onCallContact,
  isDark = false,
}) => {
  // CRITICAL PRIVACY MANDATE: Exclude private contacts even if marked favorite!
  const favoriteContacts = contacts.filter((c) => c.isFavorite && !c.isPrivate);

  return (
    <div className={`h-full flex flex-col p-4 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-800'}`}>
      <div className="flex-1 overflow-y-auto pb-20">
        {favoriteContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-500">No favorite contacts yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Add contacts to favorites by clicking the star on their details
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteContacts.map((contact) => (
              <div
                key={contact.id}
                id={`favorite-card-${contact.id}`}
                onClick={() => onCallContact(contact.phoneNumbers[0] || contact.normalizedNumber, contact)}
                className={`flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-150 border hover:scale-[1.02] active:scale-98 ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900'
                    : 'bg-zinc-50 border-zinc-200/80 hover:bg-zinc-100/80 shadow-2xs'
                }`}
              >
                <div className="relative mb-2.5">
                  {contact.photoUri ? (
                    <img
                      src={contact.photoUri}
                      alt={contact.name}
                      className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-sky-500/20"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm"
                      style={{ backgroundColor: getAvatarColor(contact.name) }}
                    >
                      {contact.name[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-600 text-white shadow-xs">
                    <Phone className="w-3 h-3 fill-current" />
                  </div>
                </div>

                <p className="text-sm font-medium text-center truncate w-full text-zinc-900 dark:text-zinc-100">
                  {contact.name}
                </p>
                <p className="text-[11px] text-zinc-400 text-center truncate w-full mt-0.5">
                  {formatIndianPhoneNumber(contact.phoneNumbers[0] || '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getAvatarColor(name: string): string {
  const colors = ['#0284c7', '#059669', '#7c3aed', '#db2777', '#ea580c', '#4f46e5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
