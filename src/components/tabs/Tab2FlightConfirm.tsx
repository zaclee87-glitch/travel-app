import React from 'react';
import { useTrip } from '../../context/TripContext';
import { CURRENCY_SYMBOLS } from '../../services/mcpClient';
import {
  Plane,
  Clock,
  ArrowRight,
  Luggage,
  Leaf,
  CheckCircle2,
  Calendar,
  CloudSun,
  MapPin,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const Tab2FlightConfirm: React.FC = () => {
  const {
    selectedDestination,
    flightOptions,
    selectedFlight,
    selectFlight,
    preferences,
    lockDestinationAndFlight,
    isGeneratingItinerary,
    setActiveTab,
  } = useTrip();

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column: Destination Deep Dive (Localized scroll) */}
      <div className="w-full lg:w-[420px] xl:w-[480px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/80 p-5 overflow-y-auto shrink-0 flex flex-col gap-4">
        {/* Banner with Destination Hero */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
          <div className="h-48 w-full relative">
            <img
              src={selectedDestination.image}
              alt={selectedDestination.city}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex items-center gap-2 text-xs text-sky-300 font-mono">
                <span>{selectedDestination.code}</span>
                <span>·</span>
                <span>{selectedDestination.country}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedDestination.city}
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDestination.tagline}
            </p>

            {/* Zero-pill metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="text-slate-300">{selectedDestination.seasonStatus}</span>
              <span>·</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {selectedDestination.avgTempC}°C ({selectedDestination.avgTempF}°F)
              </span>
              <span>·</span>
              <span className="text-sky-300 font-mono tabular-nums">
                {selectedDestination.rainChancePct}% Rain Index
              </span>
            </div>
          </div>
        </div>

        {/* Airport & Transit Dossier */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Port of Entry & Transit Overview
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Target Hub</span>
              <span className="font-mono text-slate-200">
                {selectedDestination.city} Metropolitan Area ({selectedDestination.code})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Origin Departure</span>
              <span className="font-mono text-slate-200">{preferences.originAirport}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Travel Dates</span>
              <span className="font-mono text-slate-200">
                {preferences.startDate} → {preferences.endDate}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Party Size</span>
              <span className="font-mono text-slate-200">
                {preferences.partySize} {preferences.partySize === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>
          </div>
        </div>

        {/* Weather advisory note from rvibek/smthery */}
        <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-sky-300 font-medium">
            <CloudSun className="w-3.5 h-3.5" />
            <span>Meteorological Radar Advisory</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {selectedDestination.weatherForecast}. Our automated wet-weather contingency replanner will monitor active precipitation radar windows for outdoor slots.
          </p>
        </div>

        <button
          onClick={() => setActiveTab(1)}
          className="text-xs text-slate-400 hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer mt-auto"
        >
          <span>← Change destination or parameters</span>
        </button>
      </div>

      {/* Right Column: Live Flight Options & Direct Confirmation Action */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400" />
                Live Flight Options for {selectedDestination.city} ({selectedDestination.code})
              </h2>
              <p className="text-xs text-slate-400">
                Retrieved directly through Smithery MCP server <span className="font-mono text-sky-300">@gvzq/flight-mcp</span>
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {flightOptions.length} Direct & Connecting Routes
            </div>
          </div>

          {/* Flight Options Cards */}
          <div className="space-y-3">
            {flightOptions.map((flight) => {
              const isSelected = selectedFlight?.id === flight.id;
              const totalPrice = flight.price * preferences.partySize;

              return (
                <div
                  key={flight.id}
                  onClick={() => selectFlight(flight)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/60 ${
                    isSelected
                      ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-950/20 shadow-md'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Airline & Route timing */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {flight.airline}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {flight.flightNumber}
                        </span>
                        <span>·</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {flight.cabinClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm font-mono">
                        <div>
                          <span className="text-base font-bold text-white tabular-nums">
                            {flight.departureTime}
                          </span>
                          <div className="text-[11px] text-slate-500">{preferences.originAirport.slice(0, 3)}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {flight.duration}
                          </span>
                          <div className="w-20 sm:w-28 h-px bg-slate-700 relative my-1">
                            <Plane className="w-2.5 h-2.5 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                          <span
                            className={`text-[10px] ${
                              flight.stops === 'Nonstop' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {flight.stops}
                            {flight.stopCity ? ` · ${flight.stopCity}` : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-base font-bold text-white tabular-nums">
                            {flight.arrivalTime}
                          </span>
                          <div className="text-[11px] text-slate-500">{selectedDestination.code}</div>
                        </div>
                      </div>
                    </div>

                    {/* Flight Specs & Price */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-mono">
                          {preferences.partySize > 1 ? `${currencySymbol}${flight.price} × ${preferences.partySize}` : 'Total roundtrip'}
                        </div>
                        <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                          {currencySymbol}
                          {totalPrice.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Luggage className="w-3 h-3 text-slate-400" />
                          {flight.baggageIncluded ? 'Baggage incl.' : 'Carry-on only'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Leaf className="w-3 h-3 text-emerald-400" />
                          {flight.carbonKg}kg CO₂
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lock-In & Generation Action Section */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-white">
                Destination & Flight Lock-in
              </h4>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Locking in <span className="text-white font-medium">{selectedDestination.city}</span> with{' '}
              <span className="text-white font-medium">{selectedFlight?.airline || 'ANA'}</span> initializes your dynamic 4-day itinerary, seeded with festivals, local culinary markets, and instant wet-weather contingency routes.
            </p>
          </div>

          <button
            onClick={lockDestinationAndFlight}
            disabled={isGeneratingItinerary}
            className="px-6 py-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/60 whitespace-nowrap shrink-0"
          >
            {isGeneratingItinerary ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Base Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Lock In & Generate Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
