import { useSyncExternalStore } from 'react';
import {
  CurrencyCode,
  DestinationProposal,
  FlightOption,
  BookingItem,
  ItineraryDay,
  ActivityItem,
  MCPServiceStatus,
  ProposedPlan,
  AIChatMessage,
} from '../types/travel';

import tokyoImg from '../assets/images/dest_tokyo_night_1790310457788.jpg';
import parisImg from '../assets/images/dest_paris_classic_1790310471519.jpg';
import romeImg from '../assets/images/dest_rome_ancient_1790310483443.jpg';
import reykjavikImg from '../assets/images/dest_reykjavik_nordic_1790310496558.jpg';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  SGD: 'S$',
  AUD: 'A$',
};

export const INITIAL_DESTINATIONS: DestinationProposal[] = [
  {
    id: 'dest-tokyo',
    city: 'Tokyo',
    country: 'Japan',
    code: 'TYO',
    tagline: 'Hypermodern metropolises, tranquil shrines & world-class gastronomy',
    image: tokyoImg,
    estFlightCost: 1120,
    seasonStatus: 'Shoulder Season',
    avgTempC: 19,
    avgTempF: 66,
    weatherForecast: 'Crisp autumn breeze with sporadic rainfall',
    rainChancePct: 35,
    vibeMatchPct: 96,
    highlights: ['Tsukiji Gourmet Arcade', 'Meiji Forest Shrine', 'Shibuya Sky Vista', 'Yanaka Heritage Laneways'],
    mcpSource: {
      flight: 'WanderPulse Demo Flights Catalog',
      weather: 'WanderPulse Demo Weather Catalog',
    },
  },
  {
    id: 'dest-paris',
    city: 'Paris',
    country: 'France',
    code: 'PAR',
    tagline: 'Haussmannian elegance, world-renowned impressionism & café culture',
    image: parisImg,
    estFlightCost: 740,
    seasonStatus: 'Shoulder Season',
    avgTempC: 16,
    avgTempF: 61,
    weatherForecast: 'Overcast skies with mild river mist',
    rainChancePct: 45,
    vibeMatchPct: 92,
    highlights: ['Musée d’Orsay', 'Covered Passages of 2nd Arr.', 'Montmartre Harvest Fest', 'Saint-Germain Cafés'],
    mcpSource: {
      flight: 'WanderPulse Demo Flights Catalog',
      weather: 'WanderPulse Demo Weather Catalog',
    },
  },
  {
    id: 'dest-rome',
    city: 'Rome',
    country: 'Italy',
    code: 'ROM',
    tagline: 'Living museum of classical antiquity, lively piazzas & trattorias',
    image: romeImg,
    estFlightCost: 860,
    seasonStatus: 'Peak Season',
    avgTempC: 24,
    avgTempF: 75,
    weatherForecast: 'Golden Mediterranean sun with brief thermal showers',
    rainChancePct: 20,
    vibeMatchPct: 88,
    highlights: ['Capitoline Galleries', 'Forum Antiquities', 'Trastevere Aperitivo', 'Teatro dell’Opera'],
    mcpSource: {
      flight: 'WanderPulse Demo Flights Catalog',
      weather: 'WanderPulse Demo Weather Catalog',
    },
  },
  {
    id: 'dest-reykjavik',
    city: 'Reykjavik',
    country: 'Iceland',
    code: 'KEF',
    tagline: 'Dramatic volcanic glaciers, geothermal sanctuaries & aurora vistas',
    image: reykjavikImg,
    estFlightCost: 620,
    seasonStatus: 'Off-Peak',
    avgTempC: 6,
    avgTempF: 43,
    weatherForecast: 'Subarctic winds with auroral clarity windows',
    rainChancePct: 55,
    vibeMatchPct: 85,
    highlights: ['Harpa Concert Hall', 'Perlan Ice Cave Dome', 'Laugavegur Boutiques', 'Thingvellir Fissures'],
    mcpSource: {
      flight: 'WanderPulse Demo Flights Catalog',
      weather: 'WanderPulse Demo Weather Catalog',
    },
  },
];

// ----------------------------------------------------
// Error & Description Types
// ----------------------------------------------------
export class McpNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpNotFoundError';
  }
}

export function describeMcpError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  if (err instanceof McpNotFoundError) {
    return err.message;
  }
  if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('timed out')) {
    return 'The MCP server request timed out after 15 seconds. The server might be temporarily busy.';
  }
  if (
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('ECONNREFUSED')
  ) {
    return 'Unable to reach the local MCP server at /api/mcp. Please ensure the server is online.';
  }
  return err.message || 'An error occurred while communicating with the MCP server.';
}

// ----------------------------------------------------
// MCP External Store & Reactive Hook
// ----------------------------------------------------
export interface McpLiveStatus {
  status: 'connected' | 'offline' | 'idle';
  latency: number | null; // in milliseconds
  lastCall: string | null;
  lastError: string | null;
  serverInfo: {
    name: string;
    version: string;
    protocolVersion: string;
  };
  dataset: {
    flightsCount: number;
    hotelsCount: number;
    destinationsCount: number;
    attractionsCount: number;
    note: string;
  };
}

let currentStatus: McpLiveStatus = {
  status: 'idle',
  latency: null,
  lastCall: null,
  lastError: null,
  serverInfo: {
    name: 'wanderpulse-travel-mcp',
    version: '3.0.0',
    protocolVersion: '2025-11-25',
  },
  dataset: {
    flightsCount: 10,
    hotelsCount: 9,
    destinationsCount: 4,
    attractionsCount: 11,
    note: 'Demo dataset: illustrative travel planning catalog bundled with this app, not verified against live airline GDS or hotel inventory.',
  },
};

const listeners = new Set<() => void>();

function emitStatusChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateStatus(updates: Partial<McpLiveStatus>) {
  currentStatus = { ...currentStatus, ...updates };
  emitStatusChange();
}

export function useMcpStatus(): McpLiveStatus {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => currentStatus,
    () => currentStatus
  );
}

// ----------------------------------------------------
// Real MCP Client for /api/mcp (Protocol 2025-11-25)
// ----------------------------------------------------
let rpcIdCounter = 0;
let isInitialized = false;
let negotiatedProtocol = '2025-11-25';

async function performMcpRequest(method: string, params?: any, timeoutMs = 15000): Promise<any> {
  const signal = AbortSignal.timeout(timeoutMs);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  if (isInitialized) {
    headers['MCP-Protocol-Version'] = negotiatedProtocol;
  }

  const payload: any = {
    jsonrpc: '2.0',
    method,
  };

  if (method !== 'notifications/initialized') {
    payload.id = ++rpcIdCounter;
  }

  if (params !== undefined) {
    payload.params = params;
  }

  const res = await fetch('/api/mcp', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (method === 'notifications/initialized') {
    return { ok: true };
  }

  if (!res.ok) {
    let errBody: any;
    try {
      errBody = await res.json();
    } catch (_) {}
    throw new Error(errBody?.error?.message || `MCP HTTP error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || `JSON-RPC error ${json.error.code}`);
  }

  return json.result;
}

async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;

  try {
    const initResult = await performMcpRequest('initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: {
        name: 'wanderpulse-client',
        version: '3.0.0',
      },
    });

    negotiatedProtocol = initResult?.protocolVersion || '2025-11-25';

    await performMcpRequest('notifications/initialized');
    isInitialized = true;
  } catch (err: any) {
    updateStatus({
      status: 'offline',
      latency: null,
      lastError: err.message,
      lastCall: new Date().toISOString(),
    });
    throw err;
  }
}

export async function callMcp(
  tool: string,
  args: Record<string, any> = {}
): Promise<{ data: any; rawPayload: any; latency: number }> {
  const t0 = performance.now();
  try {
    await ensureInitialized();

    const callResult = await performMcpRequest('tools/call', {
      name: tool,
      arguments: args,
    });

    const elapsed = Math.round(performance.now() - t0);

    let payload: any = null;
    if (callResult?.structuredContent) {
      payload = callResult.structuredContent;
    } else if (callResult?.content?.[0]?.text) {
      try {
        payload = JSON.parse(callResult.content[0].text);
      } catch (_) {
        payload = { result: callResult.content[0].text };
      }
    }

    if (callResult?.isError) {
      if (payload && payload.found === false) {
        updateStatus({
          status: 'connected',
          latency: elapsed,
          lastCall: new Date().toISOString(),
        });
        throw new McpNotFoundError(payload.message || `No result found for ${JSON.stringify(args)}`);
      }
      throw new Error(payload?.message || `MCP tool "${tool}" returned an execution error`);
    }

    updateStatus({
      status: 'connected',
      latency: elapsed,
      lastError: null,
      lastCall: new Date().toISOString(),
    });

    const data = payload?.result !== undefined ? payload.result : payload;
    return { data, rawPayload: payload, latency: elapsed };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - t0);
    const isNetworkOrTimeout =
      err.name === 'AbortError' ||
      err.message?.includes('HTTP error 5') ||
      err.message?.includes('Failed to fetch');

    if (isNetworkOrTimeout) {
      isInitialized = false;
      updateStatus({
        status: 'offline',
        latency: null,
        lastError: err.message,
        lastCall: new Date().toISOString(),
      });
    }

    throw err;
  }
}

// ----------------------------------------------------
// High-Level Data Fetchers Using MCP Tools
// ----------------------------------------------------
export async function fetchMCPStatus(): Promise<MCPServiceStatus[]> {
  try {
    const { data, latency } = await callMcp('get_mcp_status', {});
    return [
      {
        serverId: data.server?.name || 'wanderpulse-travel-mcp',
        name: data.server?.title || 'WanderPulse Travel Planning MCP (bundled demo dataset)',
        transport: 'streamable-mcp-http',
        verifiedVersion: data.server?.version || '3.0.0',
        status: 'connected',
        latencyMs: latency,
        lastSync: new Date().toISOString(),
      },
    ];
  } catch (err) {
    return [
      {
        serverId: 'wanderpulse-travel-mcp',
        name: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
        transport: 'streamable-mcp-http',
        verifiedVersion: '3.0.0',
        status: 'standby',
        latencyMs: 0,
        lastSync: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchFlights(
  destinationCode: string,
  currency: CurrencyCode = 'USD',
  partySize = 1
): Promise<FlightOption[]> {
  const { data } = await callMcp('search_flights', {
    destination: destinationCode,
    currency,
    partySize,
  });

  return (data || []).map((f: any) => ({
    id: f.id,
    airline: f.airline,
    airlineCode: f.airlineCode,
    flightNumber: f.flightNumber,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    duration: f.duration,
    stops: f.stops,
    stopCity: f.stopCity,
    price: f.pricePerPerson || f.basePrice,
    cabinClass: f.cabinClass,
    carbonKg: f.carbonKg,
    baggageIncluded: f.baggageIncluded,
    mcpServer: f.mcpSource || 'wanderpulse-travel-mcp',
  }));
}

export async function fetchHotels(
  destinationCity: string,
  nights = 4,
  currency: CurrencyCode = 'USD'
): Promise<BookingItem[]> {
  const { data } = await callMcp('search_hotels', {
    destination: destinationCity,
    nights,
    currency,
  });

  return (data || []).map((h: any) => ({
    id: h.id,
    type: 'hotel' as const,
    title: h.name,
    subtitle: h.neighborhood,
    provider: 'WanderPulse MCP (demo dataset)',
    rating: h.rating,
    reviewCount: h.reviews,
    price: h.pricePerNight || h.basePricePerNight,
    priceUnit: '/ night',
    status: 'recommended' as const,
    details: h.amenities,
    badge: h.badge,
    mcpSource: h.mcpSource || 'wanderpulse-travel-mcp',
  }));
}

export async function fetchAttractions(
  destinationCity: string,
  category?: string
): Promise<ActivityItem[]> {
  const { data } = await callMcp('get_attractions', {
    destination: destinationCity,
    ...(category ? { category } : {}),
  });

  return (data || []).map((a: any, idx: number) => ({
    id: a.id || `act-${idx + 1}`,
    timeSlot: (idx % 2 === 0 ? 'Morning' : 'Evening') as 'Morning' | 'Evening',
    title: a.title,
    category: (a.category || 'Culture') as ActivityItem['category'],
    location: a.location,
    durationHours: a.durationHours || 2.0,
    cost: a.cost || 0,
    isOutdoor: Boolean(a.isOutdoor),
    isAnchorEvent: Boolean(a.isAnchorEvent),
    weatherSuitability: (a.weatherSuitability || 'All-Weather') as ActivityItem['weatherSuitability'],
    description: a.description,
    rainAlternative: a.rainAlternative,
  }));
}

export async function replanForWetWeather(
  destinationCity: string,
  currentActivities: ActivityItem[]
): Promise<ActivityItem[]> {
  try {
    const { data } = await callMcp('replan_rain', {
      destination: destinationCity,
      rainyDays: [1, 2, 3, 4],
    });

    const replannedDay = data?.replannedDays?.[0];
    if (replannedDay?.activities && replannedDay.activities.length > 0) {
      return replannedDay.activities.map((a: any, idx: number) => ({
        id: a.id || `act-replan-${idx + 1}`,
        timeSlot: (idx % 2 === 0 ? 'Morning' : 'Evening') as 'Morning' | 'Evening',
        title: a.title,
        category: (a.category || 'Culture') as ActivityItem['category'],
        location: a.location || 'Covered Cultural Center',
        durationHours: a.durationHours || 2.0,
        cost: a.cost || 0,
        isOutdoor: false,
        isAnchorEvent: Boolean(a.isAnchorEvent),
        weatherSuitability: 'Indoor Only' as const,
        description: a.description,
      }));
    }
  } catch (err) {
    console.error('Wet weather replan MCP tool call failed:', err);
  }

  // Swap any outdoor activity locally with its rainAlternative if already present
  return currentActivities.map((act) => {
    if (act.isOutdoor && act.rainAlternative) {
      return {
        ...act,
        title: act.rainAlternative.title,
        category: (act.rainAlternative.category || 'Culture') as ActivityItem['category'],
        location: act.rainAlternative.location,
        description: act.rainAlternative.description,
        cost: act.rainAlternative.cost,
        isOutdoor: false,
        weatherSuitability: 'Indoor Only' as const,
      };
    }
    return act;
  });
}

export function generateInitialDays(city: string, activities: ActivityItem[]): ItineraryDay[] {
  const dates = ['Wed, Oct 14', 'Thu, Oct 15', 'Fri, Oct 16', 'Sat, Oct 17'];
  const themes = [
    'Arrival & Historic Sanctuaries',
    'Gastronomic Heritage & Covered Arcades',
    'Artisan Quarters & Grand Festival',
    'Panoramic Skylines & Hidden Izakayas',
  ];
  const forecasts = [
    { tempC: 21, condition: 'Clear Skies', rainChance: 10, isRainy: false },
    { tempC: 19, condition: 'Passing Showers', rainChance: 68, isRainy: true },
    { tempC: 22, condition: 'Mild & Sunny', rainChance: 15, isRainy: false },
    { tempC: 20, condition: 'Partly Cloudy', rainChance: 25, isRainy: false },
  ];

  return [1, 2, 3, 4].map((dayNum, idx) => {
    const dayActivities = activities.slice(idx * 2, idx * 2 + 2);
    const finalActs =
      dayActivities.length >= 2
        ? dayActivities
        : [
            activities[0] || {
              id: `act-gen-${dayNum}-1`,
              timeSlot: 'Morning',
              title: `${city} Highlights Exploration`,
              category: 'Culture',
              location: 'City Center',
              durationHours: 2.5,
              cost: 15,
              isOutdoor: true,
              isAnchorEvent: false,
              weatherSuitability: 'Sunny Preferred',
              description: `Morning exploration of key monuments and local markets in ${city}.`,
              rainAlternative: {
                title: `${city} Fine Arts Museum`,
                category: 'Culture',
                location: 'Museum Quarter',
                description: 'Covered galleries and world-class heritage collections.',
                cost: 16,
              },
            },
            activities[1] || {
              id: `act-gen-${dayNum}-2`,
              timeSlot: 'Evening',
              title: `${city} Night Skyline & Dining`,
              category: 'Culinary',
              location: 'Downtown',
              durationHours: 2.0,
              cost: 35,
              isOutdoor: false,
              isAnchorEvent: true,
              weatherSuitability: 'All-Weather',
              description: `Atmospheric dinner and evening drinks with panoramic views.`,
            },
          ];

    return {
      dayNumber: dayNum,
      date: dates[idx],
      theme: themes[idx],
      forecast: forecasts[idx],
      activities: finalActs,
      isRainContingencyActive: false,
    };
  });
}

export async function sendAIPlanQuery(
  query: string,
  history: AIChatMessage[] = [],
  currentContext: any = {}
): Promise<{ replyText: string; proposedPlan?: ProposedPlan }> {
  try {
    const res = await fetch('/api/ai-plan-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history, currentContext }),
    });
    if (!res.ok) throw new Error('AI Plan Query failed');
    const data = await res.json();
    return {
      replyText: data.replyText,
      proposedPlan: data.proposedPlan,
    };
  } catch (err: any) {
    return {
      replyText: `I encountered an issue connecting to the AI planning service: ${
        err.message || 'Unknown error'
      }. Please try again.`,
    };
  }
}
