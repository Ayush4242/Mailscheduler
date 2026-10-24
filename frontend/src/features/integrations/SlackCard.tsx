import React, { useState } from 'react';
import { SlackStatus } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  CheckCircle2,
  AlertCircle,
  Unlink,
  Zap,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Link2,
} from 'lucide-react';

interface SlackCardProps {
  slackStatus: SlackStatus;
  onRefresh: () => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const SlackCard: React.FC<SlackCardProps> = ({
  slackStatus,
  onRefresh,
  isOpenModal: externalModalOpen,
  onCloseModal: externalOnClose,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'webhook' | 'oauth' | 'dev'>('webhook');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [channelName, setChannelName] = useState('rate-limit-alerts');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showModal = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setShowModal = (val: boolean) => {
    if (externalOnClose && !val) externalOnClose();
    setInternalModalOpen(val);
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Slack? Alerts will no longer be posted.')) return;
    try {
      setLoading(true);
      await api.slack.disconnect();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setLoading(true);
      const res = await api.slack.sendTestMessage();
      alert(res.message);
    } catch (err: any) {
      alert(
        'Slack Ping Failed: ' +
          err.message +
          '\n\nTip: If using bot tokens, verify the bot is in your channel by typing "/invite @reachinbox_alerts" in Slack.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.slack.connectManual({
        webhookUrl,
        channelName,
        teamName: 'ReachInbox Workspace',
      });
      setSuccessMsg('Successfully linked and tested Slack channel!');
      setTimeout(() => {
        setShowModal(false);
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify Slack webhook.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevConnect = async () => {
    try {
      setLoading(true);
      await api.slack.devConnect();
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sleek Slack Integration Banner (Warm Light Theme) */}
      <div className="rounded-2xl bg-white border border-orange-100 p-5 shadow-xs relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4A154B]/10 border border-[#E01E5A]/20 flex items-center justify-center text-[#E01E5A] shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1c1917]">Slack Quota Alerts</h3>
                {slackStatus.connected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    #{slackStatus.integration?.channelName || 'connected'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle className="w-3 h-3" /> Inactive
                  </span>
                )}
              </div>

              <p className="text-xs text-[#78716c] mt-0.5">
                {slackStatus.connected
                  ? `Active in ${slackStatus.integration?.teamName || 'Workspace'}. Deduplicated alerts trigger whenever a sender exceeds their hourly dispatch quota.`
                  : 'Receive real-time Slack notifications whenever an hourly email limit is hit and rescheduled by BullMQ.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {slackStatus.connected ? (
              <>
                <button
                  onClick={handleSendTest}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-orange-900 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-200 transition shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-orange-600" />
                  {loading ? 'Sending...' : 'Test Slack Ping'}
                </button>

                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  title="Disconnect"
                  className="p-2 rounded-xl text-xs text-[#78716c] hover:text-rose-600 hover:bg-rose-50 border border-orange-200/80 bg-white transition shadow-xs"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-sm transition"
              >
                <Link2 className="w-3.5 h-3.5" />
                Connect Channel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slack Configuration Modal (Warm Light Theme) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#fffdfa] border border-orange-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-[#1c1917]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#4A154B]/10 border border-[#E01E5A]/20 flex items-center justify-center text-[#E01E5A]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1917]">Connect Slack Channel</h3>
                  <p className="text-[11px] text-[#78716c]">Post rate limit notifications directly to your team</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 text-[#78716c] hover:text-[#1c1917] flex items-center justify-center transition shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="grid grid-cols-3 p-1 bg-white border border-orange-200 rounded-xl my-4 text-xs font-medium shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('webhook')}
                className={`py-1.5 rounded-lg transition font-semibold ${
                  activeTab === 'webhook'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Webhook URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('oauth')}
                className={`py-1.5 rounded-lg transition font-semibold ${
                  activeTab === 'oauth'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Slack OAuth
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dev')}
                className={`py-1.5 rounded-lg transition font-semibold ${
                  activeTab === 'dev'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Quick Dev Mock
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tab 1: Webhook */}
            {activeTab === 'webhook' && (
              <form onSubmit={handleManualConnect} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44403c] mb-1">
                    Incoming Webhook URL
                  </label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                    className="w-full bg-[#faf8f5] border border-orange-200 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none font-mono"
                  />
                  <p className="text-[11px] text-[#78716c] mt-1">
                    Created via <strong className="text-[#1c1917]">api.slack.com/apps</strong> &rarr; Incoming Webhooks
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#44403c] mb-1">
                    Channel Identifier
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="rate-limit-alerts"
                    className="w-full bg-[#faf8f5] border border-orange-200 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] placeholder-[#a8a29e] outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Verifying Webhook...' : 'Verify & Connect Channel'}
                </button>
              </form>
            )}

            {/* Tab 2: OAuth */}
            {activeTab === 'oauth' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 mx-auto flex items-center justify-center text-orange-600">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1c1917]">One-Click Workspace Authorization</h4>
                  <p className="text-xs text-[#78716c] max-w-sm mx-auto mt-1">
                    Redirect to Slack's authorization portal to grant channel broadcast permissions.
                  </p>
                </div>

                <a
                  href="/api/slack/oauth"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition"
                >
                  Authorize on Slack.com
                </a>
              </div>
            )}

            {/* Tab 3: Dev Mock */}
            {activeTab === 'dev' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-amber-700">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1c1917]">Local Development Mock Channel</h4>
                  <p className="text-xs text-[#78716c] max-w-sm mx-auto mt-1">
                    Connect a simulated Slack channel for offline evaluation and UI inspection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDevConnect}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-semibold border border-orange-200 transition shadow-xs"
                >
                  {loading ? 'Simulating Connection...' : 'Simulate Connected Channel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
