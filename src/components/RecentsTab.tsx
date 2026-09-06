import React from 'react';
import { CallRecord } from '../types';
import { Phone, ArrowDownLeft, ArrowUpRight, PhoneMissed, PhoneOff, Clock } from 'lucide-react';
import { formatIndianPhoneNumber } from '../data/initialData';

interface RecentsTabProps {
  records: CallRecord[];
  onCallNumber: (number: string) => void;
  isDark?: boolean;
}

export const RecentsTab: React.FC<RecentsTabProps> = ({
  records,
  onCallNumber,
  isDark = false,
}) => {
  // CRITICAL PRIVACY MANDATE: Filter out all private call records!
  const publicRecords = records.filter((r) => !r.isPrivate);

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-800'}`}>
      <div className="flex-1 overflow-y-auto px-4 pb-20 divide-y divide-zinc-100 dark:divide-zinc-900/60">
        {publicRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-500">No recent calls</p>
            <p className="text-xs text-zinc-400 mt-1">Calls you make or receive will appear here</p>
          </div>
        ) : (
          publicRecords.map((record) => {
            const isMissed = record.callType === 'missed';
            const isRejected = record.callType === 'rejected';

            return (
              <div
                key={record.id}
                id={`recent-call-${record.id}`}
                onClick={() => onCallNumber(record.phoneNumber)}
                className="flex items-center justify-between py-3 px-1 rounded-xl cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50 transition-colors group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Call direction indicator icon */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-900">
                    {record.callType === 'incoming' && (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {record.callType === 'outgoing' && (
                      <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    )}
                    {record.callType === 'missed' && (
                      <PhoneMissed className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    {record.callType === 'rejected' && (
                      <PhoneOff className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isMissed ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {record.contactName || formatIndianPhoneNumber(record.phoneNumber)}
                    </p>

                    <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                      <span className="capitalize">{record.callType}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(record.timestamp)}</span>
                      {record.durationSeconds > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(record.durationSeconds)}</span>
                        </>
                      )}
                      {record.simSlot && (
                        <span className="text-[10px] px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          SIM {record.simSlot}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Call Button */}
                <button
                  type="button"
                  id={`redial-btn-${record.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCallNumber(record.phoneNumber);
                  }}
                  title={`Call ${record.phoneNumber}`}
                  className="p-2.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
                >
                  <Phone className="w-4 h-4 fill-current" />
                </button>
              </div>
            );
          })
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
