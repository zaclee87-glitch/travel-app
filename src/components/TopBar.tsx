import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { CURRENCY_SYMBOLS, useMcpStatus } from '../services/mcpClient';
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
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Terminal,
} from 'lucide-react';

const TABS = [
  { id: 1, label: 'Discovery & Preferences', icon: Compass },
  { id: 2, label: 'Flights & Destination', icon: Plane },
  { id: 3, label: 'Itinerary Builder', icon: CalendarDays },
  { id: 4, label: 'Bookings & Logistics', icon: ShieldCheck },
  { id: 5, label: 'Summary & Share', icon: FileCheck2 },
  { id: 6, label: 'Ask Agent', icon: Terminal },
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

  const liveMcp = useMcpStatus();
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
            travel-mcp
          </span>
        </div>

        {/* Zone 2: Clean 6 navigation tabs */}
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

        {/* Zone 3: Actions & Status */}
        <div className="flex items-center gap-2.5">
          {/* AI Holiday Planner Chat Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-95 rounded-md transition-all cursor-pointer shadow-sm shadow-sky-950/60"
            title="Open AI Studio Holiday Planner Chat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {/* Real MCP Integration Status Indicator */}
          <button
            onClick={() => setShowMCPModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-md hover:border-slate-700 transition-colors cursor-pointer"
            title="WanderPulse MCP Server Connection Inspector"
          >
            <Activity
              className={`w-3.5 h-3.5 ${
                liveMcp.status === 'connected'
                  ? 'text-emerald-400 animate-pulse'
                  : liveMcp.status === 'offline'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            />
            <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">
              {liveMcp.status === 'connected'
                ? `MCP: ${liveMcp.latency !== null ? `${liveMcp.latency}ms` : '--'}`
                : liveMcp.status === 'offline'
                ? 'MCP: Offline'
                : 'MCP: Ready'}
            </span>
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

      {/* Real MCP Server Diagnostic Modal */}
      {showMCPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveMcp.status === 'connected'
                      ? 'bg-emerald-400 animate-ping'
                      : liveMcp.status === 'offline'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
                <h3 className="text-sm font-semibold text-white">
                  WanderPulse Travel Planning MCP Inspector
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-sky-400 bg-sky-950/60 border border-sky-800/60 hover:bg-sky-900/60 rounded transition-colors cursor-pointer"
                  title="Refresh from MCP"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh from MCP</span>
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
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-sky-300">
                    {liveMcp.serverInfo.name}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      liveMcp.status === 'connected'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : liveMcp.status === 'offline'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {liveMcp.status === 'connected' ? 'Connected' : liveMcp.status === 'offline' ? 'Offline' : 'Standby'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-1">
                  <div>Endpoint: <span className="text-slate-200">/api/mcp</span> (Streamable HTTP)</div>
                  <div>Protocol Version: <span className="text-slate-200">{liveMcp.serverInfo.protocolVersion}</span></div>
                  <div>
                    Measured Browser Latency:{' '}
                    <span className="text-emerald-400 font-semibold">
                      {liveMcp.latency !== null ? `${liveMcp.latency} ms` : '--'}
                    </span>
                  </div>
                  <div>
                    Dataset Catalog:{' '}
                    <span className="text-sky-300 font-semibold">
                      {liveMcp.dataset.destinationsCount} destinations · {liveMcp.dataset.flightsCount} flights · {liveMcp.dataset.hotelsCount} hotels · {liveMcp.dataset.attractionsCount} attractions
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-200/90 leading-relaxed">
                <p className="font-semibold text-amber-300 mb-0.5">Demo Dataset Transparency:</p>
                {liveMcp.dataset.note}
              </div>

              {/* Tool Registry */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Registered MCP Tools (6):</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {[
                    'search_flights',
                    'search_hotels',
                    'get_weather',
                    'get_attractions',
                    'replan_rain',
                    'get_mcp_status',
                  ].map((t) => (
                    <div
                      key={t}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between"
                    >
                      <span className="text-slate-300">{t}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
                </div>
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
