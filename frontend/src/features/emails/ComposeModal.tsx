import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  X,
  Upload,
  Clock,
  Send,
  Users,
  Eye,
  Edit3,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'single' | 'campaign'>('single');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [startTime, setStartTime] = useState('');
  const [delayBetweenMs, setDelayBetweenMs] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract all valid emails via regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const parsedRecipients = Array.from(new Set(recipientInput.match(emailRegex) || []));

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRecipientInput((prev) => (prev ? `${prev}\n${content}` : content));
        setMode('campaign');
      }
    };
    reader.readAsText(file);
  };

  const calculateRunTimeSeconds = () => {
    if (parsedRecipients.length <= 1) return 0;
    return Math.round(((parsedRecipients.length - 1) * delayBetweenMs) / 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Please provide an email subject.');
      return;
    }
    if (!body.trim()) {
      setError('Please provide an email body.');
      return;
    }
    if (parsedRecipients.length === 0) {
      setError('Please enter at least one valid recipient address or upload a CSV.');
      return;
    }

    try {
      setLoading(true);

      const scheduledAtIso =
        scheduleType === 'later' && startTime ? new Date(startTime).toISOString() : undefined;

      if (parsedRecipients.length === 1 && mode === 'single') {
        // Single Dispatch
        await api.emails.scheduleSingle({
          recipient: parsedRecipients[0],
          subject,
          body,
          scheduledAt: scheduledAtIso,
          hourlyLimit,
        });
      } else {
        // Bulk Campaign Dispatch
        await api.campaigns.schedule({
          title: `Campaign: ${subject.slice(0, 32)}`,
          subject,
          body,
          recipients: parsedRecipients,
          scheduledAt: scheduledAtIso,
          delayBetweenEmailsMs: delayBetweenMs,
          hourlyLimit,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] border border-orange-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-[#1c1917]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-orange-100 bg-gradient-to-r from-orange-50/60 to-amber-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1c1917]">Compose Dispatch</h2>
              <p className="text-[11px] text-[#78716c]">Queue emails with distributed pacing & rate limit safety</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex p-0.5 bg-white border border-orange-200 rounded-xl text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                  mode === 'single'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode('campaign')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                  mode === 'campaign'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Bulk Campaign
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 text-[#78716c] hover:text-[#1c1917] flex items-center justify-center transition shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Recipient Input & CSV Option */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#44403c] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                {mode === 'single' ? 'Recipient Email' : 'Campaign Recipients (CSV / List)'}
              </label>

              {mode === 'campaign' && (
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-700 hover:text-orange-800 transition">
                  <Upload className="w-3 h-3" />
                  <span>Upload CSV / TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {mode === 'single' ? (
              <input
                type="email"
                required
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="recipient@domain.com"
                className="w-full bg-[#faf8f5] border border-orange-200/80 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition font-mono"
              />
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="Paste multiple emails or import CSV (e.g. user1@test.com, user2@test.com)..."
                  className="w-full bg-[#faf8f5] border border-orange-200/80 focus:border-orange-500 rounded-xl p-3 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition font-mono leading-relaxed"
                />

                {/* Recipient Parser Badge */}
                <div className="flex items-center justify-between text-[11px] text-[#78716c]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Detected: <strong className="font-mono text-[#1c1917]">{parsedRecipients.length}</strong> recipients
                  </span>
                  {parsedRecipients.length > 0 && (
                    <span className="font-mono text-[10px] text-orange-700 font-medium">
                      Pacing: {calculateRunTimeSeconds()}s total delivery window
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-[#44403c] mb-1.5">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Follow-up: Q4 Strategy Review"
              className="w-full bg-[#faf8f5] border border-orange-200/80 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition"
            />
          </div>

          {/* Body with Edit/Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#44403c]">Email Body</label>
              <div className="flex p-0.5 bg-white border border-orange-200 rounded-lg text-[10px] shadow-xs">
                <button
                  type="button"
                  onClick={() => setTab('edit')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    tab === 'edit'
                      ? 'bg-orange-600 text-white font-semibold shadow-xs'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    tab === 'preview'
                      ? 'bg-orange-600 text-white font-semibold shadow-xs'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {tab === 'edit' ? (
              <textarea
                rows={5}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{name}},&#10;&#10;Here is the update regarding..."
                className="w-full bg-[#faf8f5] border border-orange-200/80 focus:border-orange-500 rounded-xl p-3.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition leading-relaxed resize-y font-sans"
              />
            ) : (
              <div className="min-h-[120px] bg-white border border-orange-200 rounded-xl p-4 text-xs text-[#292524] whitespace-pre-wrap leading-relaxed shadow-xs">
                {body.trim() ? body : <span className="text-[#a8a29e] italic">No content typed yet...</span>}
              </div>
            )}
          </div>

          {/* Scheduling Options */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-orange-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1c1917] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                Execution Timing
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType('now')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    scheduleType === 'now'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white border border-orange-200 text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Send Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('later')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    scheduleType === 'later'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white border border-orange-200 text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Schedule Later
                </button>
              </div>
            </div>

            {scheduleType === 'later' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <input
                  type="datetime-local"
                  required={scheduleType === 'later'}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-orange-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[#1c1917] outline-none shadow-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Advanced Pacing Controls */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-mono font-medium text-orange-700 hover:text-orange-800 flex items-center gap-1 transition"
            >
              <span>{showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Pacing & Rate Limit Controls</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-2xl bg-[#faf8f5] border border-orange-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-semibold text-[#44403c] mb-1">
                    Inter-Send Delay ({delayBetweenMs / 1000}s)
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={delayBetweenMs}
                    onChange={(e) => setDelayBetweenMs(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-[#78716c] mt-0.5">Staggers sends to protect SMTP reputation</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#44403c] mb-1">
                    Sender Hourly Quota ({hourlyLimit}/hr)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={hourlyLimit}
                    onChange={(e) => setHourlyLimit(Number(e.target.value))}
                    className="w-full bg-white border border-orange-200 rounded-xl px-3 py-1.5 text-xs text-[#1c1917] outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#78716c] mt-0.5">Alerts Slack & reschedules if quota is reached</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50 flex items-center justify-between">
          <p className="text-[11px] text-[#78716c] font-mono">
            {parsedRecipients.length > 0
              ? `${parsedRecipients.length} destination${parsedRecipients.length > 1 ? 's' : ''} queued`
              : 'Fill in details to dispatch'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716c] hover:text-[#1c1917] transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/25 transition disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              {loading
                ? 'Queueing in BullMQ...'
                : scheduleType === 'later'
                ? 'Schedule Queue'
                : 'Dispatch Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
