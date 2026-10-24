import React from 'react';
import { ScheduledEmail } from '../../types/index.js';
import {
  ExternalLink,
  RefreshCw,
  Send,
  ChevronRight,
  Inbox,
} from 'lucide-react';

interface EmailTableProps {
  emails: ScheduledEmail[];
  loading: boolean;
  type: 'scheduled' | 'sent';
  onRefresh: () => void;
  onOpenCompose: () => void;
  onSelectEmail: (email: ScheduledEmail) => void;
}

export const EmailTable: React.FC<EmailTableProps> = ({
  emails,
  loading,
  type,
  onRefresh,
  onOpenCompose,
  onSelectEmail,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Sent
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Scheduled
          </span>
        );
    }
  };

  const getRecipientInitials = (email: string) => {
    const namePart = email.split('@')[0] || '';
    return namePart.slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-2xl bg-white border border-orange-100 overflow-hidden shadow-xs">
      {/* Table Header Bar */}
      <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50/40 via-white to-amber-50/40">
        <div>
          <h2 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
            <span>{type === 'scheduled' ? 'Scheduled Queue' : 'Dispatched Deliveries'}</span>
            <span className="text-[11px] font-mono text-orange-800 font-semibold px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200">
              {emails.length} record{emails.length === 1 ? '' : 's'}
            </span>
          </h2>
          <p className="text-xs text-[#78716c] mt-0.5">
            {type === 'scheduled'
              ? 'BullMQ timers running in Redis memory; jobs dispatch automatically when due.'
              : 'Completed SMTP dispatches via Ethereal with verified delivery metadata.'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Queue"
          className="p-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 text-orange-800 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading && emails.length === 0 ? (
        <div className="p-16 text-center text-[#78716c]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-600" />
          <p className="text-xs font-mono">Syncing database & queue state...</p>
        </div>
      ) : emails.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center bg-[#fdfcfb]">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-3 text-orange-600">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#1c1917]">
            No {type === 'scheduled' ? 'scheduled' : 'sent'} emails found
          </p>
          <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto">
            {type === 'scheduled'
              ? 'Compose a single dispatch or bulk campaign to watch BullMQ delays execute.'
              : 'Once emails are dispatched by the background worker, they will appear here with Ethereal preview links.'}
          </p>
          {type === 'scheduled' && (
            <button
              onClick={onOpenCompose}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Compose New Dispatch
            </button>
          )}
        </div>
      ) : (
        /* Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-100 text-[10px] font-mono uppercase tracking-wider text-[#78716c] bg-orange-50/20">
                <th className="py-3 px-6">Recipient</th>
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">{type === 'scheduled' ? 'Scheduled For' : 'Dispatched At'}</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/60 text-xs">
              {emails.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className="hover:bg-orange-50/40 cursor-pointer transition group"
                >
                  {/* Recipient */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-orange-100/80 border border-orange-200 text-orange-900 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {getRecipientInitials(email.recipient)}
                      </div>
                      <span className="font-mono font-medium text-[#1c1917] group-hover:text-orange-700 transition">
                        {email.recipient}
                      </span>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-3.5 px-6 max-w-sm">
                    <p className="truncate text-[#1c1917] font-semibold">{email.subject}</p>
                    <p className="truncate text-[11px] text-[#78716c] font-normal mt-0.5">{email.body}</p>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6 whitespace-nowrap">{getStatusBadge(email.status)}</td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-6 text-[#78716c] whitespace-nowrap font-mono text-[11px]">
                    {new Date(type === 'scheduled' ? email.scheduledAt : (email.sentAt || email.scheduledAt)).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  {/* Actions / Inspect */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {email.status === 'SENT' && email.etherealPreviewUrl && (
                        <a
                          href={email.etherealPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Ethereal Mail Inspector"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> Preview
                        </a>
                      )}

                      <button
                        onClick={() => onSelectEmail(email)}
                        className="p-1 rounded-md text-[#a8a29e] group-hover:text-orange-700 transition"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
