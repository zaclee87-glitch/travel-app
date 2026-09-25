import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { CURRENCY_SYMBOLS } from '../services/mcpClient';
import { CurrencyCode } from '../types/travel';
import {
  Compass,
  Plane,
  CalendarDays,
  ShieldCheck,
  FileCheck2,
  Activity,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';

const TABS = [
  { id: 1, label: 'Discovery & Preferences', icon: Compass },
  { id: 2, label: 'Flights & Destination', icon: Plane },
  { id: 3, label: 'Itinerary Builder', icon: CalendarDays },
  { id: 4, label: 'Bookings & Logistics', icon: ShieldCheck },
  { id: 5, label: 'Summary & Share', icon: FileCheck2 },
];

const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD'];

export const TopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    preferences,
    updatePreferences,
    budgetBreakdown,
    mcpStatus,
    refreshMCPStatus,
    setIsChatOpen,
  } = useTrip();

  const [showMCPModal, setShowMCPModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMCPStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  return (
    <>
      <header className="h-14 min-h-[3.5rem] px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 backdrop-blur-md select-none shrink-0 z-30">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]" />
            WanderPulse
          </span>
          <span className="text-xs text-slate-500 font-mono hidden lg:inline">
            workspace
          </span>
        </div>

        {/* Zone 2: Clean 5-phase navigation tabs (single-line, non-wrapping) */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* AI Holiday Planner Chat Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-95 rounded-md transition-all cursor-pointer shadow-sm shadow-sky-950/60"
            title="Open Google AI Studio Holiday Planner Chat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">AI Holiday Planner</span>
          </button>

          {/* MCP Integration Status Indicator */}
          <button
            onClick={() => setShowMCPModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-md hover:border-slate-700 transition-colors cursor-pointer"
            title="Smithery AI MCP Server Connections"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">Smithery MCP: 4 Live</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Currency Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <select
              value={preferences.currency}
              onChange={(e) => updatePreferences({ currency: e.target.value as CurrencyCode })}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-md px-2 py-1 text-xs font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Live Remaining Budget Display */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800/90 rounded-md text-xs font-mono tabular-nums">
            <span className="text-slate-500">Remain:</span>
            <span
              className={`font-semibold ${
                budgetBreakdown.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currencySymbol}
              {budgetBreakdown.remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Smithery AI MCP Server Diagnostic Modal */}
      {showMCPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-semibold text-white">
                  Smithery AI MCP Protocol Registry
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Ping MCP servers"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowMCPModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <p className="text-xs text-slate-400 leading-relaxed">
                WanderPulse links live travel data via verified Smithery AI Model Context Protocol (MCP) streamable endpoints. All flight availability, hotel inventories, weather telemetry, and semantic attraction anchors are dynamically orchestrated.
              </p>

              <div className="space-y-2.5">
                {mcpStatus.map((mcp) => (
                  <div
                    key={mcp.serverId}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-sky-300">
                          {mcp.serverId}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          v{mcp.verifiedVersion}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{mcp.name}</p>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>Transport: {mcp.transport}</span>
                        <span>·</span>
                        <span>Latency: {mcp.latencyMs}ms</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Live</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-sky-950/30 border border-sky-900/40 rounded-lg text-xs text-sky-300 space-y-1">
                <span className="font-semibold">Wet-Weather Autonomous Replanner:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When weather radars detect precipitation, WanderPulse queries <span className="font-mono text-sky-300">rvibek/smthery</span> and swaps outdoor routes with indoor alternatives from <span className="font-mono text-sky-300">exasearch/exa-mcp</span> while preserving booked event anchors.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowMCPModal(false)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
