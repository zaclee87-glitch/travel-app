import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { CURRENCY_SYMBOLS } from '../../services/mcpClient';
import {
  FileCheck2,
  Share2,
  Printer,
  Download,
  Plane,
  Hotel,
  Calendar,
  DollarSign,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Umbrella,
} from 'lucide-react';

export const Tab5SummaryShare: React.FC = () => {
  const {
    selectedDestination,
    selectedFlight,
    itineraryDays,
    bookings,
    budgetBreakdown,
    preferences,
    isGlobalRainContingency,
    resetTrip,
  } = useTrip();

  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  const confirmedHotel = bookings.find((b) => b.type === 'hotel' && b.status === 'confirmed');
  const confirmedTransit = bookings.filter((b) => b.type === 'transit' && b.status === 'confirmed');
  const confirmedAttractions = bookings.filter((b) => b.type === 'attraction' && b.status === 'confirmed');

  const budgetUsagePct = Math.min(
    100,
    Math.round((budgetBreakdown.totalCost / preferences.totalBudget) * 100),
  );

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadSummary = () => {
    const tripReport = {
      title: `WanderPulse Itinerary - ${selectedDestination.city}, ${selectedDestination.country}`,
      destination: selectedDestination.city,
      country: selectedDestination.country,
      currency: preferences.currency,
      dates: `${preferences.startDate} to ${preferences.endDate}`,
      partySize: preferences.partySize,
      flight: selectedFlight,
      lodging: confirmedHotel,
      budget: budgetBreakdown,
      contingencyMode: isGlobalRainContingency ? 'Wet-Weather Active' : 'Standard Sunny',
      itinerary: itineraryDays,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tripReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `WanderPulse_${selectedDestination.city}_Itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Action Bar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Master Trip Itinerary & Export Dossier
          </h2>
          <p className="text-xs text-slate-400">
            Consolidated manifest with confirmed flights, stays, dynamic daily timeline, and budget audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Share Trip</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-sky-950/60"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Localized vertical scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Master Trip Overview Header Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-sky-400 font-semibold">{selectedDestination.code}</span>
                <span>·</span>
                <span>{selectedDestination.country}</span>
                <span>·</span>
                <span>{preferences.partySize} {preferences.partySize === 1 ? 'Traveler' : 'Travelers'}</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {selectedDestination.city} Expedition
              </h1>
              <p className="text-xs text-slate-300">
                {preferences.startDate} through {preferences.endDate} &middot;{' '}
                {isGlobalRainContingency ? (
                  <span className="text-amber-400 font-medium">☔ Wet-Weather Re-planned Plan</span>
                ) : (
                  <span className="text-emerald-400 font-medium">☀️ Primary Weather Plan</span>
                )}
              </p>
            </div>

            {/* Quick Master Budget Summary */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg min-w-[240px] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Total Budget:</span>
                <span className="text-white font-semibold tabular-nums">
                  {currencySymbol}
                  {preferences.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Committed:</span>
                <span className="text-slate-200 font-semibold tabular-nums">
                  {currencySymbol}
                  {budgetBreakdown.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    budgetUsagePct <= 90 ? 'bg-sky-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${budgetUsagePct}%` }}
                />
              </div>
              <div className="flex justify-between pt-0.5 text-[11px]">
                <span className="text-slate-500">Remainder:</span>
                <span
                  className={`font-bold tabular-nums ${
                    budgetBreakdown.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currencySymbol}
                  {budgetBreakdown.remainingBudget.toLocaleString()} ({100 - budgetUsagePct}% left)
                </span>
              </div>
            </div>
          </div>

          {/* Logistics Confirmation Grid (Flights & Hotel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flight Ticket Summary */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Plane className="w-4 h-4 text-sky-400" />
                  <span>Confirmed Flight Details</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Status: Confirmed
                </span>
              </div>

              {selectedFlight ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Airline / Flight:</span>
                    <span className="font-mono text-white font-semibold">
                      {selectedFlight.airline} ({selectedFlight.flightNumber})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Route:</span>
                    <span className="font-mono text-white">
                      {preferences.originAirport.slice(0, 3)} ⇄ {selectedDestination.code} ({selectedFlight.stops})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="font-mono text-white">
                      Dep {selectedFlight.departureTime} → Arr {selectedFlight.arrivalTime}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Flight Cost:</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">
                      {currencySymbol}
                      {(selectedFlight.price * preferences.partySize).toLocaleString()} ({preferences.partySize} pax)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No flight selected.</p>
              )}
            </div>

            {/* Stay & Lodging Summary */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Hotel className="w-4 h-4 text-sky-400" />
                  <span>Lodging & Accommodation</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Ref: {confirmedHotel?.confirmationRef || 'Pending'}
                </span>
              </div>

              {confirmedHotel ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Property:</span>
                    <span className="font-semibold text-white">
                      {confirmedHotel.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Neighborhood:</span>
                    <span className="text-slate-200">{confirmedHotel.subtitle}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-mono text-white">4 Nights Standard Stay</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Total Lodging:</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">
                      {currencySymbol}
                      {(confirmedHotel.price * 4).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No hotel reserved yet.</p>
              )}
            </div>
          </div>

          {/* Day-by-Day Master Itinerary Manifest */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Full Day-by-Day Timeline</span>
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                {itineraryDays.length} Days Programmed
              </div>
            </div>

            <div className="space-y-4">
              {itineraryDays.map((day) => (
                <div
                  key={day.dayNumber}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-sky-300">
                        Day {day.dayNumber}
                      </span>
                      <span>·</span>
                      <span className="text-slate-300 font-medium">{day.date}</span>
                      <span>·</span>
                      <span className="text-white font-semibold">{day.theme}</span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span>Forecast: {day.forecast.tempC}°C ({day.forecast.condition})</span>
                      {day.isRainContingencyActive && (
                        <span className="text-amber-400 font-medium">☔ Wet-weather route</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          act.wasReplacedForRain
                            ? 'bg-amber-950/20 border-amber-900/40'
                            : act.isAnchorEvent
                            ? 'bg-sky-950/20 border-sky-900/40'
                            : 'bg-slate-950/60 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-slate-300">
                            {act.timeSlot}
                          </span>
                          <span className="font-mono text-emerald-400 tabular-nums">
                            {act.cost === 0 ? 'Free' : `${currencySymbol}${act.cost}`}
                          </span>
                        </div>
                        <div className="font-semibold text-white">{act.title}</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {act.location}
                          </span>
                          <span>·</span>
                          <span>{act.durationHours}h</span>
                          {act.isAnchorEvent && (
                            <>
                              <span>·</span>
                              <span className="text-sky-300 font-semibold">Anchor</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stored Logistics & Vouchers */}
          {(confirmedTransit.length > 0 || confirmedAttractions.length > 0) && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Additional Transit Passes & Reserved Vouchers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...confirmedTransit, ...confirmedAttractions].map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{v.title}</div>
                      <div className="text-[11px] text-slate-400">{v.subtitle}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-emerald-400 font-bold">{v.confirmationRef}</div>
                      <div className="text-[10px] text-slate-500">Confirmed</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Trip Button */}
          <div className="pt-6 pb-4 flex justify-between items-center border-t border-slate-800">
            <button
              onClick={resetTrip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Plan New Trip</span>
            </button>

            <div className="text-[11px] text-slate-500 font-mono">
              WanderPulse Travel Studio &middot; Powered by WanderPulse Travel Planning MCP (Demo Dataset)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
