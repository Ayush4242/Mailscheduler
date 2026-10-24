import React, { useEffect } from 'react';
import { ScheduledEmail } from '../../types/index.js';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Mail,
  Server,
  ShieldCheck,
  Send,
  Search,
  Check,
} from 'lucide-react';

interface EmailDrawerProps {
  email: ScheduledEmail | null;
  onClose: () => void;
}

export const EmailDrawer: React.FC<EmailDrawerProps> = ({ email, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!email) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(email.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSent = email.status === 'SENT';
  const isFailed = email.status === 'FAILED';
  const isProcessing = email.status === 'PROCESSING';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#fffdfa] border-l border-orange-200 shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300 text-[#1c1917]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1c1917]">Dispatch Details</h3>
                <p className="text-[11px] font-mono text-[#78716c] flex items-center gap-1.5 mt-0.5">
                  ID: {email.id.slice(0, 16)}...
                  <button
                    onClick={handleCopyId}
                    className="hover:text-orange-700 transition p-0.5 rounded"
                    title="Copy Full ID"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 text-[#78716c] hover:text-[#1c1917] flex items-center justify-center transition shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf8f5] border border-orange-200/80">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#a8a29e] font-semibold">
                  Current Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {isSent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Delivered
                    </span>
                  )}
                  {isProcessing && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Processing Dispatch
                    </span>
                  )}
                  {isFailed && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Dispatch Failed
                    </span>
                  )}
                  {!isSent && !isProcessing && !isFailed && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                      <Clock className="w-3.5 h-3.5" /> Queued in BullMQ
                    </span>
                  )}
                </div>
              </div>

              {isSent && email.etherealPreviewUrl && (
                <a
                  href={email.etherealPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ethereal Preview
                </a>
              )}
            </div>

            {/* Lifecycle Pipeline Timeline */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold mb-3">
                Lifecycle Pipeline
              </p>
              <div className="space-y-3 bg-[#faf8f5] border border-orange-100 rounded-2xl p-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#1c1917]">1. Stored in PostgreSQL</p>
                    <p className="text-[11px] text-[#78716c]">Authoritative record registered with unique idempotency key</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSent || isProcessing
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      : 'bg-orange-100 border border-orange-300 text-orange-700'
                  }`}>
                    <Server className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#1c1917]">2. Enqueued into BullMQ / Redis</p>
                    <p className="text-[11px] text-[#78716c]">
                      Scheduled for {new Date(email.scheduledAt).toLocaleTimeString()} (Job ID: {email.id.slice(0, 10)}...)
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSent
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      : isFailed
                      ? 'bg-rose-100 border border-rose-300 text-rose-700'
                      : 'bg-orange-50 border border-orange-200 text-orange-500'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#1c1917]">3. Redis Rate Limit Verification</p>
                    <p className="text-[11px] text-[#78716c]">
                      Atomic Lua script verifies sender hourly quota and inter-send delay
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSent
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      : isFailed
                      ? 'bg-rose-100 border border-rose-300 text-rose-700'
                      : 'bg-orange-50 border border-orange-200 text-orange-500'
                  }`}>
                    <Send className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#1c1917]">4. SMTP Dispatch (Ethereal)</p>
                    <p className="text-[11px] text-[#78716c]">
                      {isSent
                        ? `Message delivered with ID: ${email.messageId || 'Generated'}`
                        : isFailed
                        ? `Delivery failed: ${email.errorMessage || 'Unknown error'}`
                        : 'Awaiting worker execution'}
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSent
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      : 'bg-orange-50 border border-orange-200 text-orange-500'
                  }`}>
                    <Search className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-[#1c1917]">5. Elasticsearch Indexed</p>
                    <p className="text-[11px] text-[#78716c]">Full-text searchable across subject, recipient, and date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Meta Details */}
            <div className="space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">Metadata</p>
              <div className="bg-[#faf8f5] border border-orange-100 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-orange-100">
                  <span className="text-[#78716c]">Recipient</span>
                  <span className="font-mono font-semibold text-[#1c1917]">{email.recipient}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-orange-100">
                  <span className="text-[#78716c]">Scheduled At</span>
                  <span className="text-[#1c1917] font-medium">{new Date(email.scheduledAt).toLocaleString()}</span>
                </div>
                {email.sentAt && (
                  <div className="flex justify-between items-center py-1 border-b border-orange-100">
                    <span className="text-[#78716c]">Delivered At</span>
                    <span className="text-[#1c1917] font-medium">{new Date(email.sentAt).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#78716c]">Attempts Made</span>
                  <span className="font-mono text-[#1c1917] font-semibold">{email.attemptCount || 1} / 3</span>
                </div>
              </div>
            </div>

            {/* Email Content Preview */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">Payload Preview</p>
              <div className="bg-[#faf8f5] border border-orange-100 rounded-2xl p-4 space-y-3">
                <div className="border-b border-orange-100 pb-2">
                  <p className="text-xs font-bold text-[#1c1917]">{email.subject}</p>
                </div>
                <div className="text-xs text-[#292524] leading-relaxed whitespace-pre-wrap font-sans bg-white p-3.5 rounded-xl border border-orange-100 shadow-xs">
                  {email.body}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-orange-100 bg-[#faf8f5] flex items-center justify-between">
            <span className="text-[11px] text-[#78716c]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-orange-200 text-[#1c1917] font-mono text-[10px]">Esc</kbd> to dismiss
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 border border-orange-200 text-xs font-semibold text-orange-950 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
