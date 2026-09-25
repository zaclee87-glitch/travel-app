import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { CURRENCY_SYMBOLS } from '../../services/mcpClient';
import { DestinationProposal } from '../../types/travel';
import {
  Sparkles,
  Plane,
  CloudSun,
  Users,
  DollarSign,
  Calendar,
  Check,
  ArrowRight,
  TrendingUp,
  Send,
  Loader2,
  Bot,
} from 'lucide-react';

const VIBE_OPTIONS = [
  'Culture & History',
  'Food & Culinary',
  'Architecture',
  'Nature & Outdoors',
  'Urban Exploration',
  'Nightlife & Drinks',
  'Museums & Art',
  'Relaxation & Spas',
];

export const Tab1Discovery: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    destinations,
    selectedDestination,
    selectDestination,
    setActiveTab,
    sendChatMessage,
    setIsChatOpen,
    isAIChatLoading,
  } = useTrip();

  const [aiPrompt, setAiPrompt] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAIChatLoading) return;
    const query = aiPrompt.trim();
    setAiPrompt('');
    setIsChatOpen(true);
    await sendChatMessage(query);
  };

  const toggleVibe = (vibe: string) => {
    const current = preferences.vibeInterests;
    const next = current.includes(vibe)
      ? current.filter((v) => v !== vibe)
      : [...current, vibe];
    updatePreferences({ vibeInterests: next });
  };

  const handleSelectAndProceed = (dest: DestinationProposal) => {
    selectDestination(dest);
    setActiveTab(2);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left Column: Trip Preferences Form (Localized vertical scroll) */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/70 p-5 overflow-y-auto shrink-0 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Trip Preferences & Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Parameters feed WanderPulse Travel MCP flight and hotel query tools.
          </p>
        </div>

        {/* Total Budget Input & Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Total Budget
            </label>
            <span className="font-mono text-white tabular-nums font-semibold">
              {currencySymbol}
              {preferences.totalBudget.toLocaleString()}
            </span>
          </div>

          <input
            type="range"
            min={1000}
            max={12000}
            step={250}
            value={preferences.totalBudget}
            onChange={(e) => updatePreferences({ totalBudget: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[1800, 3500, 7500].map((b) => (
              <button
                key={b}
                onClick={() => updatePreferences({ totalBudget: b })}
                className={`py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                  preferences.totalBudget === b
                    ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {currencySymbol}
                {b.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Dates & Party Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Departure
            </label>
            <input
              type="date"
              value={preferences.startDate}
              onChange={(e) => updatePreferences({ startDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Return
            </label>
            <input
              type="date"
              value={preferences.endDate}
              onChange={(e) => updatePreferences({ endDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Party Size & Origin City */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              Party Size
            </label>
            <select
              value={preferences.partySize}
              onChange={(e) => updatePreferences({ partySize: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Solo traveler</option>
              <option value={2}>2 Couple / Pair</option>
              <option value={4}>4 Family / Group</option>
              <option value={6}>6 Large Group</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Plane className="w-3 h-3 text-slate-400" />
              Origin City
            </label>
            <input
              type="text"
              value={preferences.originAirport}
              onChange={(e) => updatePreferences({ originAirport: e.target.value })}
              placeholder="e.g. JFK, LHR"
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Trip Vibe & Interests */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium block">
            Trip Vibe & Interests
          </label>
          <div className="flex flex-wrap gap-1.5">
            {VIBE_OPTIONS.map((vibe) => {
              const isSelected = preferences.vibeInterests.includes(vibe);
              return (
                <button
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
          <span>Active MCP endpoint: </span>
          <span className="font-mono text-slate-400">/api/mcp</span> &middot;{' '}
          <span className="font-mono text-slate-400">wanderpulse-travel-mcp</span>
        </div>
      </div>

      {/* Right Column: Destination Proposals Grid (Localized vertical scroll) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        {/* Google AI Studio Interactive Holiday Query Box */}
        <div className="p-4 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <span>Google AI Studio Holiday Architect</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 rounded">
                    Gemini Flash
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Type what kind of holiday you're looking for &mdash; AI Studio runs inference, matches WanderPulse MCP tools, and auto-proposes selections.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab(6)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer whitespace-nowrap self-start sm:self-auto font-medium"
              >
                <span>Ask MCP Agent Panel →</span>
              </button>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap self-start sm:self-auto font-medium"
              >
                <Bot className="w-3.5 h-3.5 text-sky-400" />
                <span>Holiday Chatbox →</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleAISubmit} className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 5-day cultural trip to Japan with great food and a $4000 budget for 2 people..."
              disabled={isAIChatLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim() || isAIChatLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-950/60 shrink-0"
            >
              {isAIChatLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Run AI Plan</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Prompt Idea Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-500 font-mono">Ideas:</span>
            {[
              '🍣 Tokyo street food & shrines ($3,800)',
              '🍷 Romantic Paris art & wine escape ($4,200)',
              '🏛️ Rome ancient pasta crawl ($3,200)',
              '🌋 Iceland aurora & geothermal spas ($4,000)',
            ].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => {
                  setAiPrompt(idea);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 transition-colors cursor-pointer"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Recommended Destination Options
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated against budget, travel range, and vibe match via live MCP telemetry.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {destinations.length} Verified Destinations
          </div>
        </div>

        {/* 2x2 Responsive Destination Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {destinations.map((dest) => {
            const isSelected = selectedDestination.id === dest.id;
            return (
              <div
                key={dest.id}
                className={`relative rounded-xl overflow-hidden border transition-all flex flex-col bg-slate-900/60 ${
                  isSelected
                    ? 'border-sky-500 ring-1 ring-sky-500 shadow-lg shadow-sky-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Destination Header Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="font-mono tracking-wider font-semibold text-sky-300">
                          {dest.code}
                        </span>
                        <span>·</span>
                        <span>{dest.country}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {dest.city}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-mono">Est. Flight</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                        {currencySymbol}
                        {dest.estFlightCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dest.tagline}
                  </p>

                  {/* Metadata Row: Zero-pill discipline (unboxed text with · separators) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-300">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      <span>{dest.seasonStatus}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-slate-300 tabular-nums">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{dest.avgTempC}°C / {dest.avgTempF}°F</span>
                    </span>
                    <span>·</span>
                    <span className="text-slate-300">
                      Rain Chance: <span className="font-mono font-medium text-sky-300 tabular-nums">{dest.rainChancePct}%</span>
                    </span>
                    <span>·</span>
                    <span className="font-medium text-emerald-400 font-mono tabular-nums">
                      {dest.vibeMatchPct}% Vibe Match
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
                      Curated Highlights
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.highlights.map((hl) => (
                        <span
                          key={hl}
                          className="text-xs text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/40"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Selection Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => selectDestination(dest)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select Destination</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleSelectAndProceed(dest)}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-900/50"
                    >
                      <span>Confirm & View Flights</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
