export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'AUD';

export interface TripPreferences {
  currency: CurrencyCode;
  totalBudget: number;
  startDate: string;
  endDate: string;
  originAirport: string;
  partySize: number;
  vibeInterests: string[];
}

export interface DestinationProposal {
  id: string;
  city: string;
  country: string;
  code: string;
  tagline: string;
  image: string;
  estFlightCost: number;
  seasonStatus: 'Peak Season' | 'Off-Peak' | 'Shoulder Season';
  avgTempC: number;
  avgTempF: number;
  weatherForecast: string;
  rainChancePct: number;
  vibeMatchPct: number;
  highlights: string[];
  mcpSource: {
    flight: string;
    weather: string;
  };
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: 'Nonstop' | '1 Stop' | '2 Stops';
  stopCity?: string;
  price: number;
  cabinClass: string;
  carbonKg: number;
  baggageIncluded: boolean;
  mcpServer: string;
}

export interface RainyDayAlternative {
  title: string;
  category: string;
  location: string;
  description: string;
  cost: number;
}

export interface ActivityItem {
  id: string;
  timeSlot: 'Morning' | 'Midday' | 'Afternoon' | 'Evening';
  title: string;
  category: 'Culture' | 'Culinary' | 'Sightseeing' | 'Event / Festival' | 'Nature' | 'Nightlife';
  location: string;
  durationHours: number;
  cost: number;
  isOutdoor: boolean;
  isAnchorEvent: boolean; // Preserved in wet-weather replanning
  weatherSuitability: 'Sunny Preferred' | 'Indoor Only' | 'All-Weather';
  description: string;
  rainAlternative?: RainyDayAlternative;
  wasReplacedForRain?: boolean;
  originalActivityTitle?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  forecast: {
    tempC: number;
    condition: string;
    rainChance: number;
    isRainy: boolean;
  };
  activities: ActivityItem[];
  isRainContingencyActive: boolean;
}

export interface BookingItem {
  id: string;
  type: 'hotel' | 'transit' | 'attraction';
  title: string;
  subtitle: string;
  provider: string;
  rating: number;
  reviewCount: number;
  price: number;
  priceUnit: string;
  status: 'recommended' | 'confirmed';
  confirmationRef?: string;
  details: string[];
  badge?: string;
  mcpSource: string;
}

export interface MCPServiceStatus {
  serverId: string;
  name: string;
  transport: string;
  verifiedVersion: string;
  status: 'connected' | 'standby';
  latencyMs: number;
  lastSync: string;
}

export interface ProposedPlan {
  destinationId: 'dest-tokyo' | 'dest-paris' | 'dest-rome' | 'dest-reykjavik';
  destinationCity: string;
  destinationCountry: string;
  destinationCode: string;
  totalBudget: number;
  currency: CurrencyCode;
  partySize: number;
  startDate: string;
  endDate: string;
  vibeInterests: string[];
  themeTitle: string;
  reasoning: string;
  hotelSuggestion?: {
    name: string;
    neighborhood: string;
    estPricePerNight: number;
    why: string;
  };
  flightSuggestion?: {
    airline: string;
    preference: string;
  };
  customActivities?: Array<{
    day: number;
    timeSlot: 'Morning' | 'Midday' | 'Afternoon' | 'Evening';
    title: string;
    category: ActivityItem['category'];
    location: string;
    durationHours: number;
    cost: number;
    isOutdoor: boolean;
    description: string;
  }>;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  proposedPlan?: ProposedPlan;
  isApplied?: boolean;
}
