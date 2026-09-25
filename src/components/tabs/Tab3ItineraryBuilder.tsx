import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { CURRENCY_SYMBOLS } from '../../services/mcpClient';
import { ActivityItem } from '../../types/travel';
import {
  CloudRain,
  Sun,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  RefreshCw,
  Umbrella,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';

export const Tab3ItineraryBuilder: React.FC = () => {
  const {
    selectedDestination,
    itineraryDays,
    isGlobalRainContingency,
    toggleGlobalRainContingency,
    toggleDayRainContingency,
    moveActivity,
    addCustomActivity,
    removeActivity,
    preferences,
    setActiveTab,
  } = useTrip();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  // New activity form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityItem['category']>('Sightseeing');
  const [newTimeSlot, setNewTimeSlot] = useState<ActivityItem['timeSlot']>('Afternoon');
  const [newLocation, setNewLocation] = useState('');
  const [newDuration, setNewDuration] = useState('2');
  const [newCost, setNewCost] = useState('0');
  const [newIsOutdoor, setNewIsOutdoor] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '$';

  const currentDay =
    itineraryDays.find((d) => d.dayNumber === selectedDayNumber) || itineraryDays[0];

  const handleGlobalRainToggle = async () => {
    setIsReplanning(true);
    await toggleGlobalRainContingency();
    setIsReplanning(false);
  };

  const handleDayRainToggle = async (dayNum: number) => {
    setIsReplanning(true);
    await toggleDayRainContingency(dayNum);
    setIsReplanning(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const customAct: ActivityItem = {
      id: `act-custom-${Date.now()}`,
      timeSlot: newTimeSlot,
      title: newTitle.trim(),
      category: newCategory,
      location: newLocation.trim() || selectedDestination.city,
      durationHours: Number(newDuration) || 2,
      cost: Number(newCost) || 0,
      isOutdoor: newIsOutdoor,
      isAnchorEvent: false,
      weatherSuitability: newIsOutdoor ? 'Sunny Preferred' : 'Indoor Only',
      description: newDescription.trim() || 'Custom user activity addition.',
    };

    addCustomActivity(selectedDayNumber, customAct);
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Banner: Day Navigation & Rain Contingency Master Switch */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {itineraryDays.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            const hasRainAlert = day.forecast.isRainy;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {day.date.split(',')[0]}
                </span>
                {hasRainAlert && (
                  <span title="Rain forecast">
                    <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  </span>
                )}
                {day.isRainContingencyActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Contingency active" />
                )}
              </button>
            );
          })}
        </div>

        {/* Smart Wet-Weather Contingency Toggle (Actionable replanning button) */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden xl:block">
            <div className="text-[11px] text-slate-400 font-mono">
              Forecast radar: <span className="text-sky-300">{currentDay?.forecast.condition}</span> ({currentDay?.forecast.rainChance}% rain)
            </div>
          </div>

          <button
            onClick={handleGlobalRainToggle}
            disabled={isReplanning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
              isGlobalRainContingency
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-900 border border-sky-500/40 text-sky-300 hover:bg-sky-950/40'
            }`}
          >
            {isReplanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Replanning Contingency...</span>
              </>
            ) : isGlobalRainContingency ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Revert to Sunny Itinerary</span>
              </>
            ) : (
              <>
                <Umbrella className="w-3.5 h-3.5 text-sky-400" />
                <span>Activate Wet-Weather Replanner</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Add Activity</span>
          </button>
        </div>
      </div>

      {/* Main Timeline Viewport (Localized scroll) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        {currentDay && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Day Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Day {currentDay.dayNumber}</span>
                  <span>·</span>
                  <span>{currentDay.date}</span>
                  <span>·</span>
                  <span className="text-sky-300">
                    {currentDay.forecast.tempC}°C ({currentDay.forecast.condition})
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  {currentDay.theme}
                </h3>
              </div>

              {/* Day-specific contingency toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Day rain status:
                </span>
                <button
                  onClick={() => handleDayRainToggle(currentDay.dayNumber)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer font-mono ${
                    currentDay.isRainContingencyActive
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {currentDay.isRainContingencyActive ? '☔ Indoor Contingency' : '☀️ Sunny Route'}
                </button>
              </div>
            </div>

            {/* Contingency Notification Banner if active */}
            {currentDay.isRainContingencyActive && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <Umbrella className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Wet-Weather Autonomous Replanner Engaged</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Outdoor walking routes and open parks have been dynamically swapped for world-class sheltered galleries, indoor arcades, and underground food halls. Scheduled festival and theatre anchors are preserved.
                  </p>
                </div>
              </div>
            )}

            {/* Activities Timeline List */}
            <div className="space-y-3">
              {currentDay.activities.map((act, index) => {
                const isFirst = index === 0;
                const isLast = index === currentDay.activities.length - 1;

                return (
                  <div
                    key={act.id}
                    className={`p-4 rounded-xl border transition-all bg-slate-900/70 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      act.wasReplacedForRain
                        ? 'border-amber-500/50 bg-amber-950/10'
                        : act.isAnchorEvent
                        ? 'border-sky-500/50 bg-sky-950/15'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Activity Time Slot & Core Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-white px-2 py-0.5 bg-slate-800 rounded">
                          {act.timeSlot}
                        </span>

                        <span className="text-slate-400 font-mono">{act.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{act.location}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{act.durationHours}h</span>
                        </span>

                        {/* Anchors / Rain badges */}
                        {act.isAnchorEvent && (
                          <>
                            <span>·</span>
                            <span className="text-sky-300 font-semibold flex items-center gap-1">
                              <Shield className="w-3 h-3 text-sky-400" />
                              <span>Festival Anchor</span>
                            </span>
                          </>
                        )}

                        {act.wasReplacedForRain && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 font-medium">
                              Rain contingency swap
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-base font-semibold text-white tracking-tight">
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      {/* If replaced for rain, show original activity title */}
                      {act.wasReplacedForRain && act.originalActivityTitle && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Replaced: <span className="line-through">{act.originalActivityTitle}</span> (outdoor slot)
                        </div>
                      )}

                      {/* If has rain alternative in sunny mode, show subtle hint */}
                      {!act.wasReplacedForRain && act.rainAlternative && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Rain fallback mapped: {act.rainAlternative.title}
                        </div>
                      )}
                    </div>

                    {/* Right side: Cost & Interactive Reordering Controls */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                          {act.cost === 0 ? 'Free Entry' : `${currencySymbol}${act.cost}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {act.isOutdoor ? 'Outdoor venue' : 'Indoor venue'}
                        </div>
                      </div>

                      {/* Interactive Reordering Affordances (Up / Down / Delete) */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                        <button
                          onClick={() => moveActivity(currentDay.dayNumber, index, index - 1)}
                          disabled={isFirst}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                          title="Move activity up in timeline"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveActivity(currentDay.dayNumber, index, index + 1)}
                          disabled={isLast}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                          title="Move activity down in timeline"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeActivity(currentDay.dayNumber, act.id)}
                          className="p-1 text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer ml-1"
                          title="Remove activity from day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Step CTA */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveTab(4)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-sky-950/60"
              >
                Proceed to Bookings & Logistics →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-semibold text-white">
                Add Activity to Day {selectedDayNumber}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Activity Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Roppongi Hills Observation Deck"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Time Slot</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Midday">Midday</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Culture">Culture</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Event / Festival">Event / Festival</option>
                    <option value="Nature">Nature</option>
                    <option value="Nightlife">Nightlife</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Estimated Cost ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Duration (Hours)</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Location / Neighborhood</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Roppongi, Chiyoda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isOutdoorCheck"
                  checked={newIsOutdoor}
                  onChange={(e) => setNewIsOutdoor(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="isOutdoorCheck" className="text-xs text-slate-300 cursor-pointer">
                  This is an outdoor activity (susceptible to rain)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Brief Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add tips, meeting point, or highlights..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer"
                >
                  Add to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
