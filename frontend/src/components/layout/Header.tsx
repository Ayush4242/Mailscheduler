import React from 'react';
import { User, SlackStatus } from '../../types/index.js';
import { ExternalLink, LogOut, Database, Cpu, MessageSquare, Radio } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  slackStatus?: SlackStatus;
  onLogout: () => void;
  onOpenSlackModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, slackStatus, onLogout, onOpenSlackModal }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold text-xs tracking-tight">
              <span>RI</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-[#1c1917]">ReachInbox</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Dispatcher
                </span>
              </div>
              <p className="text-[11px] text-[#78716c]">Distributed Queue Dashboard</p>
            </div>
          </div>

          {/* Infrastructure Health Indicators */}
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-orange-100">
            {/* Redis / Queue Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-[#78350f]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Database className="w-3 h-3 text-amber-600" />
              <span className="font-mono font-medium">Redis:6379</span>
            </div>

            {/* Worker Health */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50/80 border border-orange-200 text-[11px] text-[#7c2d12]">
              <Cpu className="w-3 h-3 text-orange-600" />
              <span>Worker: <strong className="font-mono text-orange-900">5x Concurrency</strong></span>
            </div>

            {/* Slack Channel */}
            <button
              onClick={onOpenSlackModal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition ${
                slackStatus?.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                  : 'bg-amber-50/60 border-amber-200/80 text-amber-800 hover:bg-amber-100/70'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-orange-600" />
              <span>
                {slackStatus?.connected
                  ? `Slack: #${slackStatus.integration?.channelName || 'connected'}`
                  : 'Slack: Not connected'}
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Bull Board Launcher */}
          <a
            href="http://localhost:5000/admin/queues"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-200 text-xs font-semibold text-orange-900 transition shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition-transform" />
            <span>Bull Board Live</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-orange-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-orange-200 bg-orange-50 object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#1c1917] leading-tight">{user.name || 'Account'}</p>
                  <p className="text-[10px] text-[#78716c] font-mono truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="w-8 h-8 rounded-xl border border-orange-200/80 bg-white hover:bg-rose-50 hover:border-rose-200 text-[#78716c] hover:text-rose-600 flex items-center justify-center transition shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
