import React, { useState, useEffect, useCallback } from 'react';
import { User, ScheduledEmail, SlackStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { Header } from '../components/layout/Header.js';
import { SlackCard } from '../features/integrations/SlackCard.js';
import { EmailTable } from '../features/emails/EmailTable.js';
import { ComposeModal } from '../features/emails/ComposeModal.js';
import { EmailDrawer } from '../features/emails/EmailDrawer.js';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Gauge,
  MessageSquare,
  Zap,
} from 'lucide-react';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<ScheduledEmail[]>([]);
  const [slackStatus, setSlackStatus] = useState<SlackStatus>({ connected: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null);

  // Load emails and status
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduledRes, sentRes, slackRes] = await Promise.all([
        api.emails.getScheduled(),
        api.emails.getSent(),
        api.slack.getStatus(),
      ]);

      setScheduledEmails(scheduledRes.emails || []);
      setSentEmails(sentRes.emails || []);
      setSlackStatus(slackRes || { connected: false });
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-sync every 5 seconds to track BullMQ transitions live
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && !statusFilter) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const res = await api.emails.search(searchQuery, statusFilter || undefined);
      if (activeTab === 'scheduled') {
        setScheduledEmails(res.emails.filter((e) => e.status === 'SCHEDULED' || e.status === 'PROCESSING'));
      } else {
        setSentEmails(res.emails.filter((e) => e.status === 'SENT' || e.status === 'FAILED'));
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayedEmails = activeTab === 'scheduled' ? scheduledEmails : sentEmails;
  const sentSuccessCount = sentEmails.filter((e) => e.status === 'SENT').length;
  const hourlyLimit = 100;
  const hourlyUsage = sentEmails.length % hourlyLimit;
  const hourlyPercentage = Math.min(100, Math.round((hourlyUsage / hourlyLimit) * 100));

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-sans">
      <Header
        user={user}
        slackStatus={slackStatus}
        onLogout={onLogout}
        onOpenSlackModal={() => setIsSlackModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-7">
        {/* Metric Cards Ribbon (Light Warm Amber & Yellow Palette on White) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: BullMQ Queue */}
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs relative overflow-hidden group hover:border-orange-300 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">
                Queued in BullMQ
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-mono tracking-tight text-[#1c1917]">
                {scheduledEmails.length}
              </h3>
              <span className="text-xs text-[#78716c]">pending dispatch</span>
            </div>
            <p className="text-[11px] text-orange-700/80 mt-2 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Delayed timer triggers in Redis
            </p>
          </div>

          {/* Card 2: Delivered Messages */}
          <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-xs relative overflow-hidden group hover:border-amber-300 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">
                Delivered Messages
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-mono tracking-tight text-[#1c1917]">
                {sentSuccessCount}
              </h3>
              <span className="text-xs text-emerald-700 font-mono font-semibold">100% success</span>
            </div>
            <p className="text-[11px] text-[#78716c] mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Delivered via Ethereal SMTP
            </p>
          </div>

          {/* Card 3: Hourly Quota Limiter */}
          <div className="p-5 rounded-2xl bg-white border border-yellow-100 shadow-xs relative overflow-hidden group hover:border-yellow-300 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">
                Hourly Limit Window
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-mono tracking-tight text-[#1c1917]">
                {hourlyLimit} <span className="text-xs font-normal text-[#78716c]">/ hour</span>
              </h3>
            </div>
            {/* Visual Progress Bar in warm yellow / orange */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-amber-100/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, hourlyPercentage)}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-[#78716c] text-right font-medium">
                {hourlyUsage} / {hourlyLimit} sent this hour
              </p>
            </div>
          </div>

          {/* Card 4: Slack Status */}
          <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs relative overflow-hidden group hover:border-orange-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] font-semibold">
                Slack Quota Alerts
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#4A154B]/10 border border-[#E01E5A]/20 flex items-center justify-center text-[#E01E5A]">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <div className="my-2">
              {slackStatus.connected ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-semibold text-emerald-800 truncate">
                    #{slackStatus.integration?.channelName || 'connected'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono font-medium text-amber-800">Not Connected</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSlackModalOpen(true)}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition"
            >
              <Zap className="w-3 h-3" />
              {slackStatus.connected ? 'Send Test Ping / Manage' : 'Connect Slack Channel'} &rarr;
            </button>
          </div>
        </div>

        {/* Slack Card Details */}
        <SlackCard
          slackStatus={slackStatus}
          onRefresh={loadData}
          isOpenModal={isSlackModalOpen}
          onCloseModal={() => setIsSlackModalOpen(false)}
        />

        {/* Primary Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Segmented View Tabs */}
          <div className="inline-flex p-1 bg-white border border-orange-200/80 rounded-xl self-start shadow-xs">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'scheduled'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span>Scheduled Queue</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'scheduled' ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-800'
              }`}>
                {scheduledEmails.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <span>Sent Deliveries</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'sent' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {sentEmails.length}
              </span>
            </button>
          </div>

          {/* Search, Filter & Compose */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient or subject..."
                className="w-full bg-white border border-orange-200/80 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none transition shadow-xs"
              />
            </form>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-orange-200/80 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[#44403c] font-medium outline-none shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PROCESSING">Processing</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Compose Dispatch CTA */}
            <button
              onClick={() => setIsComposeOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 transition shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Dispatch</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <EmailTable
          emails={displayedEmails}
          loading={loading}
          type={activeTab}
          onRefresh={loadData}
          onOpenCompose={() => setIsComposeOpen(true)}
          onSelectEmail={(email) => setSelectedEmail(email)}
        />
      </main>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={loadData}
      />

      {/* Email Inspector Slide-over Drawer */}
      <EmailDrawer
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
};
