import React, { useState } from 'react';
import {
  Send,
  Clock,
  Gauge,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Activity,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  // Interactive Calculator State
  const [calcRecipients, setCalcRecipients] = useState(60);
  const [calcDelayMs, setCalcDelayMs] = useState(2000);
  const hourlyQuota = 100;

  const totalSeconds = Math.round(((calcRecipients - 1) * calcDelayMs) / 1000);
  const totalMinutes = (totalSeconds / 60).toFixed(1);
  const quotaUsedPercent = Math.min(100, Math.round((calcRecipients / hourlyQuota) * 100));
  const willTriggerLimit = calcRecipients > hourlyQuota;

  // Interactive Pipeline State
  const [simStep, setSimStep] = useState<number>(1);
  const [simMode, setSimMode] = useState<'normal' | 'ratelimit'>('normal');

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] font-sans selection:bg-orange-500/20 selection:text-orange-950">
      {/* =========================================================================
          HERO SECTION: Warm Amber Sunset Atmosphere (Inspired by uploaded design)
          ========================================================================= */}
      <div className="relative overflow-hidden hero-sunset-gradient text-white pt-6 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8">
        {/* Soft Organic Atmospheric Vignette & Sunlight Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#431407]/60 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Navigation - Symmetrical with Center Brand Emblem */}
          <header className="flex items-center justify-between py-3 border-b border-white/10">
            {/* Left Nav Links */}
            <div className="flex items-center gap-6 text-xs font-medium text-orange-100/80">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <span className="font-bold text-xs tracking-tight">RI</span>
              </div>
              <a href="#pipeline" className="hidden sm:inline-block hover:text-white transition">
                Architecture
              </a>
              <a href="#calculator" className="hidden sm:inline-block hover:text-white transition">
                Pacing Calculator
              </a>
            </div>

            {/* Center Brand Crest & Title */}
            <div className="text-center flex flex-col items-center">
              {/* Delicate Lotus / Sun Emblem from the reference */}
              <div className="w-6 h-6 mb-1 text-orange-200 opacity-90 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                  <path d="M12 3c-1.5 3-4 5.5-7 6 3 2 4.5 5 5 9 1-4 3-7 7-9-3-.5-5.5-3-7-6z" />
                  <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-white drop-shadow-sm font-sans">
                REACHINBOX
              </span>
              <span className="text-[9px] font-mono tracking-[0.2em] text-orange-200/80 uppercase">
                DISPATCH ENGINE
              </span>
            </div>

            {/* Right Nav Links & Register Button */}
            <div className="flex items-center gap-4 text-xs font-medium text-orange-100/80">
              <a
                href="http://localhost:5000/admin/queues"
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1 hover:text-white transition"
              >
                <span>Bull Board</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button onClick={onSignIn} className="hover:text-white transition hidden sm:inline-block">
                Sign In
              </button>

              <button
                onClick={onGetStarted}
                className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-xs shadow-lg shadow-black/10 transition active:scale-95"
              >
                Register
              </button>
            </div>
          </header>

          {/* Hero Core Content */}
          <div className="pt-16 sm:pt-24 pb-8 max-w-5xl mx-auto relative">
            {/* Flanking Visual Card 1: Left - BullMQ Stream (feathered into amber mist) */}
            <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-64 p-5 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-2xl shadow-orange-950/40 text-left pointer-events-none transform -rotate-1">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-orange-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REDIS STREAM
                </span>
                <span>port 6379</span>
              </div>
              <p className="text-xs font-semibold text-white">BullMQ Delayed Queue</p>
              <p className="text-[11px] text-orange-100/70 mt-1">Zero-polling delayed job streams awakened on exact second.</p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-orange-200">
                <span>Concurrency: 5x</span>
                <span className="text-emerald-300">0 dropped</span>
              </div>
            </div>

            {/* Flanking Visual Card 2: Right - Rate Limiting & Slack Alert (feathered into amber mist) */}
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-64 p-5 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-2xl shadow-orange-950/40 text-left pointer-events-none transform rotate-1">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-orange-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  LUA QUOTA GUARD
                </span>
                <span>sliding hour</span>
              </div>
              <p className="text-xs font-semibold text-white">100 / Hour Threshold</p>
              <p className="text-[11px] text-orange-100/70 mt-1">Atomic Lua script prevents race conditions across workers.</p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-orange-200">
                <span>Slack Broadcast</span>
                <span className="text-emerald-300">Auto-paced</span>
              </div>
            </div>

            {/* Centered Slogan / Headline matching the screenshot's three-line cadence */}
            <div className="text-center px-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.18] max-w-2xl mx-auto drop-shadow-md">
                Discover your rhythm. <br />
                Hone your dispatch. <br />
                Cultivate your purpose.
              </h1>

              {/* Sub-description */}
              <p className="mt-6 text-sm sm:text-base text-orange-100/85 max-w-lg mx-auto font-normal leading-relaxed">
                A high-deliverability email engine powered by BullMQ, Redis Lua sliding-window rate limits, and live
                Slack incident broadcasts.
              </p>

              {/* Centered App Store / Platform Badges (styled exactly like the reference image) */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {/* Platform Badge 1 */}
                <button
                  onClick={onGetStarted}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/85 hover:bg-black text-white text-left shadow-xl shadow-black/20 border border-white/10 transition active:scale-95"
                >
                  <Terminal className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-orange-200/70 font-mono leading-none">
                      Engine Runtime
                    </p>
                    <p className="text-xs font-semibold text-white leading-tight">Launch Scheduler</p>
                  </div>
                </button>

                {/* Platform Badge 2 */}
                <a
                  href="http://localhost:5000/admin/queues"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-left shadow-xl shadow-black/10 border border-white/25 transition active:scale-95"
                >
                  <Activity className="w-5 h-5 text-white shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-orange-100/70 font-mono leading-none">
                      Live Telemetry
                    </p>
                    <p className="text-xs font-semibold text-white leading-tight">Bull Board Live</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Gradient Transition from Amber Sunset into Cream */}
        <div className="hero-bottom-fade absolute bottom-0 inset-x-0 h-32 pointer-events-none" />
      </div>

      {/* =========================================================================
          SECTION 2: "An app purpose-built." (Editorial Cream Section from image)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-[#e7e0d3] pb-14">
          {/* Left Title */}
          <div className="md:col-span-5">
            <h2 className="text-2xl sm:text-3xl font-medium text-[#292524] tracking-tight">
              An engine purpose-built.
            </h2>
          </div>

          {/* Right Editorial Quote */}
          <div className="md:col-span-7">
            <p className="text-sm sm:text-base text-[#57534e] leading-relaxed">
              The two most important pillars in high-volume outbound email are deliverability and pacing. We built
              ReachInbox to ensure that not a single scheduled job is lost during server restarts, and that no sender
              account ever triggers an ESP throttling penalty.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {/* Pillar 1 */}
          <div className="p-7 rounded-3xl bg-[#fffdfa] border border-[#ede5d8] shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center mb-5">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1c1917]">BullMQ Delayed Queues</h3>
            <p className="text-xs text-[#78716c] mt-2 leading-relaxed">
              Eliminates database polling. Scheduled jobs sleep in Redis sorted sets and awaken at the exact millisecond
              needed without wasting server CPU.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-7 rounded-3xl bg-[#fffdfa] border border-[#ede5d8] shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-5">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1c1917]">Atomic Sliding Hourly Quotas</h3>
            <p className="text-xs text-[#78716c] mt-2 leading-relaxed">
              Enforced by single-transaction Redis Lua scripts. Protects domain health by never allowing more than 100
              emails per hour per sender account.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-7 rounded-3xl bg-[#fffdfa] border border-[#ede5d8] shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-[#E01E5A]/10 border border-[#E01E5A]/20 text-[#E01E5A] flex items-center justify-center mb-5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1c1917]">Live Slack Quota Alerts</h3>
            <p className="text-xs text-[#78716c] mt-2 leading-relaxed">
              Whenever a sender hits their limit, BullMQ safely reschedules remaining emails to the next hour and sends
              a clean deduplicated incident alert to Slack.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Interactive Pacing & Campaign Calculator
          ========================================================================= */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-[#f5f0e8] border border-[#e2d8c9] p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-700 font-semibold">
              Campaign Pacing Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium text-[#1c1917] mt-1">
              Estimate Dispatch Windows &amp; Quota Safety
            </h2>
            <p className="text-xs text-[#78716c] mt-1">
              Adjust parameters below to see how our inter-send delay and sliding hourly quota protect your sender score.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6 bg-[#fffdfa] border border-[#ede5d8] p-6 rounded-2xl shadow-sm">
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#44403c] font-medium">Recipients in Campaign</span>
                  <span className="font-mono text-orange-600 font-bold">{calcRecipients} contacts</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={calcRecipients}
                  onChange={(e) => setCalcRecipients(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#44403c] font-medium">Inter-Send Delay (pacing)</span>
                  <span className="font-mono text-orange-600 font-bold">
                    {(calcDelayMs / 1000).toFixed(1)}s between sends
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={250}
                  value={calcDelayMs}
                  onChange={(e) => setCalcDelayMs(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Computed Output */}
            <div className="bg-[#fffdfa] border border-[#ede5d8] p-6 rounded-2xl shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#a8a29e]">
                  Calculated Dispatch Window
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold font-mono text-[#1c1917]">{totalSeconds}s</h3>
                  <span className="text-xs text-[#78716c] font-mono">({totalMinutes} minutes)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#78716c]">Hourly Quota Consumption</span>
                  <span className="font-mono text-[#1c1917] font-semibold">{quotaUsedPercent}%</span>
                </div>
                <div className="w-full bg-[#f5f0e8] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      willTriggerLimit ? 'bg-amber-600' : 'bg-orange-600'
                    }`}
                    style={{ width: `${Math.min(100, quotaUsedPercent)}%` }}
                  />
                </div>
              </div>

              {willTriggerLimit ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Batch exceeds 100/hr limit. The remaining {calcRecipients - hourlyQuota} emails will automatically
                    be delayed to the next hour and post an alert to Slack.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Safe single window. All {calcRecipients} emails will dispatch smoothly without triggering rate
                    delays.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Interactive Architecture Pipeline Visualizer
          ========================================================================= */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-700 font-semibold">
            Execution Walkthrough
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#1c1917] mt-1">
            How Every Scheduled Dispatch Is Handled
          </h2>
          <p className="text-xs text-[#78716c] mt-1 max-w-md mx-auto">
            Click through the pipeline stages to inspect the underlying transactions and safeguards.
          </p>

          <div className="inline-flex items-center gap-2 p-1 bg-[#f5f0e8] border border-[#e2d8c9] rounded-xl mt-4 text-xs">
            <button
              onClick={() => {
                setSimMode('normal');
                setSimStep(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                simMode === 'normal'
                  ? 'bg-orange-600 text-white font-medium shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              Standard Dispatch Flow
            </button>
            <button
              onClick={() => {
                setSimMode('ratelimit');
                setSimStep(3);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                simMode === 'ratelimit'
                  ? 'bg-amber-700 text-white font-medium shadow-sm'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              Rate Limit Hit &rarr; Slack Broadcast
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="rounded-3xl bg-[#fffdfa] border border-[#ede5d8] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div
              onClick={() => setSimStep(1)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                simStep === 1
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-[#faf8f5] border-[#ede5d8] hover:border-orange-300'
              }`}
            >
              <span className="text-[10px] font-mono text-[#a8a29e]">STEP 01</span>
              <h3 className="text-xs font-semibold text-[#1c1917] mt-1">PostgreSQL Store</h3>
              <p className="text-[11px] text-[#78716c] mt-1">
                Saved with unique idempotency key to prevent duplication.
              </p>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setSimStep(2)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                simStep === 2
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-[#faf8f5] border-[#ede5d8] hover:border-orange-300'
              }`}
            >
              <span className="text-[10px] font-mono text-[#a8a29e]">STEP 02</span>
              <h3 className="text-xs font-semibold text-[#1c1917] mt-1">BullMQ Ingestion</h3>
              <p className="text-[11px] text-[#78716c] mt-1">
                Delayed timer registered into Redis zset memory streams.
              </p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setSimStep(3)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                simStep === 3
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-[#faf8f5] border-[#ede5d8] hover:border-orange-300'
              }`}
            >
              <span className="text-[10px] font-mono text-[#a8a29e]">STEP 03</span>
              <h3 className="text-xs font-semibold text-[#1c1917] mt-1">Lua Rate Limit</h3>
              <p className="text-[11px] text-[#78716c] mt-1">
                Atomic evaluation of sliding hourly quota per sender account.
              </p>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setSimStep(4)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                simStep === 4
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-[#faf8f5] border-[#ede5d8] hover:border-orange-300'
              }`}
            >
              <span className="text-[10px] font-mono text-[#a8a29e]">STEP 04</span>
              <h3 className="text-xs font-semibold text-[#1c1917] mt-1">
                {simMode === 'ratelimit' ? 'Slack Alert Post' : 'SMTP Delivery'}
              </h3>
              <p className="text-[11px] text-[#78716c] mt-1">
                {simMode === 'ratelimit'
                  ? 'Alert posted to Slack and job rescheduled to next window.'
                  : 'Delivered via Ethereal SMTP with real preview link.'}
              </p>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => setSimStep(5)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                simStep === 5
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-[#faf8f5] border-[#ede5d8] hover:border-orange-300'
              }`}
            >
              <span className="text-[10px] font-mono text-[#a8a29e]">STEP 05</span>
              <h3 className="text-xs font-semibold text-[#1c1917] mt-1">Elastic Search Sync</h3>
              <p className="text-[11px] text-[#78716c] mt-1">
                Document indexed for sub-millisecond query across history.
              </p>
            </div>
          </div>

          {/* Inspection Details Box */}
          <div className="mt-6 p-5 rounded-2xl bg-[#f5f0e8] border border-[#e2d8c9] font-mono text-xs text-[#292524]">
            <div className="flex justify-between pb-3 border-b border-[#e2d8c9] text-[#78716c] text-[11px]">
              <span>Inspection: Step {simStep} of 5</span>
              <span>Flow: {simMode === 'normal' ? 'Normal Send' : 'Rate Exceeded'}</span>
            </div>

            <div className="mt-3">
              {simStep === 1 && (
                <div className="space-y-1">
                  <p className="text-orange-700 font-bold">[PostgreSQL Transaction]</p>
                  <p className="text-[#57534e]">INSERT INTO "ScheduledEmail" (recipient, status, idempotencyKey)</p>
                  <p className="text-emerald-700">VALUES ("lead@acme.corp", "SCHEDULED", "key-a8f1") &rarr; Confirmed</p>
                </div>
              )}
              {simStep === 2 && (
                <div className="space-y-1">
                  <p className="text-orange-700 font-bold">[BullMQ Queue Ingestion]</p>
                  <p className="text-[#57534e]">emailQueue.add('send-email', payload, {"{ delay: 1800000 }"})</p>
                  <p className="text-emerald-700">Registered in Redis zset "bull:email-dispatch-queue:delayed"</p>
                </div>
              )}
              {simStep === 3 && (
                <div className="space-y-1">
                  <p className="text-orange-700 font-bold">[Redis Lua Script Evaluation]</p>
                  <p className="text-[#57534e]">EVALSHA rate_limit.lua 1 ratelimit:hourly:sender:2026-10-25T01 100 2000</p>
                  {simMode === 'normal' ? (
                    <p className="text-emerald-700">Result: {JSON.stringify({ allowed: 1, currentCount: 42, limit: 100 })} &rarr; Proceed</p>
                  ) : (
                    <p className="text-amber-800">Result: {JSON.stringify({ allowed: 0, currentCount: 100, limit: 100, nextWindow: "02:00" })} &rarr; Limit Hit!</p>
                  )}
                </div>
              )}
              {simStep === 4 && (
                <div className="space-y-1">
                  {simMode === 'normal' ? (
                    <>
                      <p className="text-orange-700 font-bold">[Nodemailer Ethereal Transport]</p>
                      <p className="text-[#57534e]">250 2.0.0 OK: message dispatched 10928374-291823</p>
                      <p className="text-emerald-700">Preview: https://ethereal.email/message/WaQKMgKddxQDoou...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[#E01E5A] font-bold">[Slack Notification Dispatched]</p>
                      <p className="text-[#57534e]">POST https://slack.com/api/chat.postMessage &rarr; #rate-limit-alerts</p>
                      <p className="text-amber-800">Alert: "⚠️ Hourly limit hit (100/100). Auto-rescheduled for 02:00 AM."</p>
                    </>
                  )}
                </div>
              )}
              {simStep === 5 && (
                <div className="space-y-1">
                  <p className="text-orange-700 font-bold">[Elasticsearch Index Updated]</p>
                  <p className="text-[#57534e]">PUT /emails/_doc/email-9b2f</p>
                  <p className="text-emerald-700">Document indexed in 1.2ms with search tokenization</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Bottom CTA & Footer
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="rounded-3xl bg-gradient-to-b from-[#292524] to-[#1c1917] text-white p-10 sm:p-14 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
            Ready to experience reliable email dispatching?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#a8a29e] max-w-md mx-auto">
            Run scheduled outbound email campaigns with atomic hourly quotas and live BullMQ telemetry today.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-lg shadow-orange-600/30 transition active:scale-95"
            >
              Launch Scheduler App
            </button>
            <button
              onClick={onSignIn}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/15 transition"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Warm Minimal Footer */}
      <footer className="border-t border-[#ede5d8] bg-[#f5f0e8] py-8 text-xs text-[#78716c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1c1917]">ReachInbox Scheduler</span>
            <span>&bull; Full-Stack Email Dispatch Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              All Systems Operational
            </span>
            <a
              href="http://localhost:5000/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="text-orange-700 hover:underline"
            >
              Queue Monitor
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
