import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TripPreferences,
  DestinationProposal,
  FlightOption,
  ItineraryDay,
  ActivityItem,
  BookingItem,
  MCPServiceStatus,
  CurrencyCode,
  ProposedPlan,
  AIChatMessage,
} from '../types/travel';
import {
  INITIAL_DESTINATIONS,
  fetchMCPStatus,
  fetchFlights,
  fetchHotels,
  fetchAttractions,
  generateInitialDays,
  replanForWetWeather,
  sendAIPlanQuery,
} from '../services/mcpClient';

interface BudgetBreakdown {
  flightsCost: number;
  hotelsCost: number;
  transitCost: number;
  activitiesCost: number;
  totalCost: number;
  remainingBudget: number;
}

interface TripContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  preferences: TripPreferences;
  updatePreferences: (updates: Partial<TripPreferences>) => void;
  destinations: DestinationProposal[];
  selectedDestination: DestinationProposal;
  selectDestination: (dest: DestinationProposal) => void;
  flightOptions: FlightOption[];
  selectedFlight: FlightOption | null;
  selectFlight: (flight: FlightOption) => void;
  itineraryDays: ItineraryDay[];
  originalItineraryDays: ItineraryDay[];
  isGlobalRainContingency: boolean;
  toggleGlobalRainContingency: () => Promise<void>;
  toggleDayRainContingency: (dayNum: number) => Promise<void>;
  moveActivity: (dayNum: number, fromIndex: number, toIndex: number) => void;
  addCustomActivity: (dayNum: number, activity: ActivityItem) => void;
  removeActivity: (dayNum: number, actId: string) => void;
  bookings: BookingItem[];
  addBooking: (item: BookingItem) => void;
  removeBooking: (id: string) => void;
  confirmBooking: (id: string, ref: string) => void;
  budgetBreakdown: BudgetBreakdown;
  mcpStatus: MCPServiceStatus[];
  refreshMCPStatus: () => Promise<void>;
  isGeneratingItinerary: boolean;
  lockDestinationAndFlight: () => Promise<void>;
  resetTrip: () => void;
  // AI Holiday Chatbox
  chatMessages: AIChatMessage[];
  isAIChatLoading: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  sendChatMessage: (text: string) => Promise<void>;
  applyProposedPlan: (plan: ProposedPlan, navigateToTab?: number) => Promise<void>;
}

const STORAGE_KEY = 'wanderpulse_trip_state_v1';

const defaultPreferences: TripPreferences = {
  currency: 'USD',
  totalBudget: 3500,
  startDate: '2026-10-14',
  endDate: '2026-10-18',
  originAirport: 'JFK (New York)',
  partySize: 1,
  vibeInterests: ['Culture & History', 'Food & Culinary', 'Architecture', 'Urban Exploration'],
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [activeTab, setActiveTabState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tab`);
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [preferences, setPreferences] = useState<TripPreferences>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prefs`);
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const [destinations] = useState<DestinationProposal[]>(INITIAL_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<DestinationProposal>(
    INITIAL_DESTINATIONS[0],
  );

  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [originalItineraryDays, setOriginalItineraryDays] = useState<ItineraryDay[]>([]);
  const [isGlobalRainContingency, setIsGlobalRainContingency] = useState<boolean>(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState<boolean>(false);

  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 'transit-pass-01',
      type: 'transit',
      title: '72-Hour Unlimited Subway & Transit Pass',
      subtitle: 'Tokyo Metro & Toei Network',
      provider: 'Tokyo Public Transit Bureau',
      rating: 4.9,
      reviewCount: 4200,
      price: 15,
      priceUnit: '/ person',
      status: 'confirmed',
      confirmationRef: 'TX-72H-9921',
      details: ['Valid for all Tokyo subway lines', 'Contactless QR gate tap', 'Airport rail discount voucher included'],
      mcpSource: 'exasearch/exa-mcp',
      badge: 'Essential Transit',
    },
  ]);

  const [mcpStatus, setMcpStatus] = useState<MCPServiceStatus[]>([]);

  // AI Holiday Chatbox State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAIChatLoading, setIsAIChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        "Hello! I am your Google AI Studio Travel Architect. Tell me what kind of holiday you're dreaming of — whether it's a food crawl in Tokyo, a romantic escape in Paris, ancient history in Rome, or chasing the Northern Lights in Iceland. I'll analyze your request, formulate a tailored strategy, and make all the live selections for you!",
      timestamp: 'Just now',
    },
  ]);

  // Persist tab & preferences
  const setActiveTab = (tab: number) => {
    setActiveTabState(tab);
    localStorage.setItem(`${STORAGE_KEY}_tab`, JSON.stringify(tab));
  };

  const updatePreferences = (updates: Partial<TripPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(`${STORAGE_KEY}_prefs`, JSON.stringify(next));
      return next;
    });
  };

  // Sync MCP status on mount
  const refreshMCPStatus = async () => {
    const servers = await fetchMCPStatus();
    setMcpStatus(servers);
  };

  useEffect(() => {
    refreshMCPStatus();
    const interval = setInterval(refreshMCPStatus, 45000);
    return () => clearInterval(interval);
  }, []);

  // Fetch flights whenever destination or preferences change
  useEffect(() => {
    let isCurrent = true;
    fetchFlights(selectedDestination.code, preferences.currency, preferences.partySize).then(
      (flights) => {
        if (isCurrent) {
          setFlightOptions(flights);
          if (!selectedFlight || !flights.some((f) => f.id === selectedFlight.id)) {
            setSelectedFlight(flights[0] || null);
          }
        }
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [selectedDestination.code, preferences.currency, preferences.partySize]);

  // Initial itinerary bootstrap if empty
  useEffect(() => {
    if (itineraryDays.length === 0) {
      fetchAttractions(selectedDestination.city).then((activities) => {
        const days = generateInitialDays(selectedDestination.city, activities);
        setItineraryDays(days);
        setOriginalItineraryDays(days);
      });
    }
  }, [selectedDestination.city]);

  const selectDestination = (dest: DestinationProposal) => {
    setSelectedDestination(dest);
  };

  const selectFlight = (flight: FlightOption) => {
    setSelectedFlight(flight);
  };

  // Lock Destination & Flight -> Tab 3 Itinerary
  const lockDestinationAndFlight = async () => {
    setIsGeneratingItinerary(true);
    try {
      const [activities, hotelItems] = await Promise.all([
        fetchAttractions(selectedDestination.city),
        fetchHotels(selectedDestination.city, 4, preferences.currency),
      ]);

      const days = generateInitialDays(selectedDestination.city, activities);
      setItineraryDays(days);
      setOriginalItineraryDays(days);
      setIsGlobalRainContingency(false);

      // Pre-seed recommended hotel in bookings if none exists
      if (!bookings.some((b) => b.type === 'hotel') && hotelItems.length > 0) {
        setBookings((prev) => [
          ...prev,
          {
            ...hotelItems[0],
            status: 'confirmed',
            confirmationRef: `HT-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        ]);
      }

      setActiveTab(3);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  // Toggle Global Wet-Weather Contingency
  const toggleGlobalRainContingency = async () => {
    const nextState = !isGlobalRainContingency;
    setIsGlobalRainContingency(nextState);

    if (!nextState) {
      // Revert completely to original sunny days non-destructively
      setItineraryDays(
        originalItineraryDays.map((d) => ({
          ...d,
          isRainContingencyActive: false,
        })),
      );
      return;
    }

    // Apply contingency replanning across all days
    const updated = await Promise.all(
      itineraryDays.map(async (day) => {
        const replannedActs = await replanForWetWeather(selectedDestination.city, day.activities);
        return {
          ...day,
          activities: replannedActs,
          isRainContingencyActive: true,
        };
      }),
    );
    setItineraryDays(updated);
  };

  // Toggle Single Day Wet-Weather Contingency
  const toggleDayRainContingency = async (dayNum: number) => {
    const targetDay = itineraryDays.find((d) => d.dayNumber === dayNum);
    if (!targetDay) return;

    const nextDayState = !targetDay.isRainContingencyActive;

    if (!nextDayState) {
      // Restore this day from originalItineraryDays
      const origDay = originalItineraryDays.find((d) => d.dayNumber === dayNum);
      if (origDay) {
        setItineraryDays((prev) =>
          prev.map((d) => (d.dayNumber === dayNum ? { ...origDay, isRainContingencyActive: false } : d)),
        );
      }
      return;
    }

    const replanned = await replanForWetWeather(selectedDestination.city, targetDay.activities);
    setItineraryDays((prev) =>
      prev.map((d) =>
        d.dayNumber === dayNum
          ? {
              ...d,
              activities: replanned,
              isRainContingencyActive: true,
            }
          : d,
      ),
    );
  };

  // Interactive Reordering: Move activity up/down
  const moveActivity = (dayNum: number, fromIndex: number, toIndex: number) => {
    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNum) return day;
        const newActivities = [...day.activities];
        if (toIndex < 0 || toIndex >= newActivities.length) return day;
        const [moved] = newActivities.splice(fromIndex, 1);
        newActivities.splice(toIndex, 0, moved);
        return { ...day, activities: newActivities };
      }),
    );
  };

  // Add Custom Activity
  const addCustomActivity = (dayNum: number, activity: ActivityItem) => {
    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNum) return day;
        return { ...day, activities: [...day.activities, activity] };
      }),
    );
    setOriginalItineraryDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNum) return day;
        return { ...day, activities: [...day.activities, activity] };
      }),
    );
  };

  // Remove Activity
  const removeActivity = (dayNum: number, actId: string) => {
    setItineraryDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== dayNum) return day;
        return { ...day, activities: day.activities.filter((a) => a.id !== actId) };
      }),
    );
  };

  // Bookings management
  const addBooking = (item: BookingItem) => {
    setBookings((prev) => {
      const existing = prev.find((b) => b.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  };

  const removeBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const confirmBooking = (id: string, ref: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'confirmed', confirmationRef: ref } : b)),
    );
  };

  // Live Budget Calculations
  const flightsCost = (selectedFlight ? selectedFlight.price : selectedDestination.estFlightCost) * preferences.partySize;
  const hotelsCost = bookings
    .filter((b) => b.type === 'hotel' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price * 4, 0); // 4 nights default
  const transitCost = bookings
    .filter((b) => b.type === 'transit' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price * preferences.partySize, 0);
  const activitiesCost = itineraryDays.reduce(
    (acc, day) => acc + day.activities.reduce((dAcc, act) => dAcc + act.cost, 0),
    0,
  ) * preferences.partySize;

  const totalCost = flightsCost + hotelsCost + transitCost + activitiesCost;
  const remainingBudget = preferences.totalBudget - totalCost;

  const budgetBreakdown: BudgetBreakdown = {
    flightsCost,
    hotelsCost,
    transitCost,
    activitiesCost,
    totalCost,
    remainingBudget,
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAIChatLoading(true);

    try {
      const response = await sendAIPlanQuery(text, chatMessages, {
        destinationCity: selectedDestination.city,
        totalBudget: preferences.totalBudget,
        partySize: preferences.partySize,
        currency: preferences.currency,
        vibeInterests: preferences.vibeInterests,
      });

      const assistantMsg: AIChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedPlan: response.proposedPlan,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AIChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          "I experienced an issue consulting Google AI Studio. Please rephrase or try again in a few moments.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAIChatLoading(false);
    }
  };

  const applyProposedPlan = async (plan: ProposedPlan, navigateToTab: number = 3) => {
    setIsGeneratingItinerary(true);
    try {
      // 1. Update preferences
      updatePreferences({
        totalBudget: plan.totalBudget,
        partySize: plan.partySize,
        currency: plan.currency || preferences.currency,
        vibeInterests:
          plan.vibeInterests && plan.vibeInterests.length > 0
            ? plan.vibeInterests
            : preferences.vibeInterests,
        startDate: plan.startDate || preferences.startDate,
        endDate: plan.endDate || preferences.endDate,
      });

      // 2. Select destination
      const targetDest =
        destinations.find(
          (d) =>
            d.id === plan.destinationId ||
            d.city.toLowerCase() === plan.destinationCity.toLowerCase(),
        ) || destinations[0];
      setSelectedDestination(targetDest);

      // 3. Fetch live flights and select best matching
      const flights = await fetchFlights(
        targetDest.code,
        plan.currency || preferences.currency,
        plan.partySize,
      );
      setFlightOptions(flights);
      if (flights.length > 0) {
        setSelectedFlight(flights[0]);
      }

      // 4. Fetch hotels and seed
      const hotelItems = await fetchHotels(
        targetDest.city,
        4,
        plan.currency || preferences.currency,
      );
      if (hotelItems.length > 0) {
        setBookings((prev) => {
          const withoutHotel = prev.filter((b) => b.type !== 'hotel');
          return [
            ...withoutHotel,
            {
              ...hotelItems[0],
              status: 'confirmed',
              confirmationRef: `HT-${Math.floor(100000 + Math.random() * 900000)}`,
            },
          ];
        });
      }

      // 5. Generate custom itinerary
      const attractions = await fetchAttractions(targetDest.city);
      let days = generateInitialDays(targetDest.city, attractions);

      // If AI proposed custom activities, inject them
      if (plan.customActivities && plan.customActivities.length > 0) {
        days = days.map((day) => {
          const customForDay = plan.customActivities?.filter((a) => a.day === day.dayNumber) || [];
          if (customForDay.length > 0) {
            const mappedCustom: ActivityItem[] = customForDay.map((ca, idx) => ({
              id: `act-ai-${day.dayNumber}-${idx}-${Date.now()}`,
              timeSlot: ca.timeSlot,
              title: ca.title,
              category: ca.category,
              location: ca.location || targetDest.city,
              durationHours: ca.durationHours || 2,
              cost: ca.cost || 0,
              isOutdoor: ca.isOutdoor,
              isAnchorEvent: ca.category === 'Event / Festival',
              weatherSuitability: ca.isOutdoor ? 'Sunny Preferred' : 'Indoor Only',
              description: ca.description,
            }));
            return {
              ...day,
              activities: [...mappedCustom, ...day.activities.slice(mappedCustom.length)],
            };
          }
          return day;
        });
      }

      setItineraryDays(days);
      setOriginalItineraryDays(days);
      setIsGlobalRainContingency(false);

      // Mark current chat messages as applied
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.proposedPlan?.themeTitle === plan.themeTitle ? { ...msg, isApplied: true } : msg,
        ),
      );

      if (navigateToTab) {
        setActiveTab(navigateToTab);
      }
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const resetTrip = () => {
    localStorage.removeItem(`${STORAGE_KEY}_tab`);
    localStorage.removeItem(`${STORAGE_KEY}_prefs`);
    setActiveTab(1);
    setPreferences(defaultPreferences);
    setSelectedDestination(INITIAL_DESTINATIONS[0]);
    setIsGlobalRainContingency(false);
  };

  return (
    <TripContext.Provider
      value={{
        activeTab,
        setActiveTab,
        preferences,
        updatePreferences,
        destinations,
        selectedDestination,
        selectDestination,
        flightOptions,
        selectedFlight,
        selectFlight,
        itineraryDays,
        originalItineraryDays,
        isGlobalRainContingency,
        toggleGlobalRainContingency,
        toggleDayRainContingency,
        moveActivity,
        addCustomActivity,
        removeActivity,
        bookings,
        addBooking,
        removeBooking,
        confirmBooking,
        budgetBreakdown,
        mcpStatus,
        refreshMCPStatus,
        isGeneratingItinerary,
        lockDestinationAndFlight,
        resetTrip,
        chatMessages,
        isAIChatLoading,
        isChatOpen,
        setIsChatOpen,
        sendChatMessage,
        applyProposedPlan,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
};
