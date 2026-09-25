import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
  CURRENCY_MULTIPLIERS,
  DATASET_STATS,
  resolveDestination,
  FLIGHTS_DATA,
  HOTELS_DATA,
  WEATHER_DATA,
  ATTRACTIONS_DATA,
} from './travel-data.js';

export const MCP_PATH = '/api/mcp';

export const SERVER_INFO = {
  name: 'wanderpulse-travel-mcp',
  title: 'WanderPulse Travel Planning MCP (demo dataset)',
  version: '3.0.0',
};

export const DATASET = {
  flightsCount: DATASET_STATS.flightsCount,
  hotelsCount: DATASET_STATS.hotelsCount,
  destinationsCount: DATASET_STATS.destinationsCount,
  attractionsCount: DATASET_STATS.attractionsCount,
  note: DATASET_STATS.note,
};

const TOOL_NAMES = [
  'search_flights',
  'search_hotels',
  'get_weather',
  'get_attractions',
  'replan_rain',
  'get_mcp_status',
];

function buildMcpServer() {
  const server = new McpServer(SERVER_INFO, {
    instructions: DATASET.note,
  });

  // 1. search_flights
  server.registerTool(
    'search_flights',
    {
      title: 'Search Flights (demo dataset)',
      description:
        'Searches available flight options, airline carriers, departure times, flight durations, carbon footprints, and fare quotes from the demo dataset bundled with this app. Use when travelers or planning agents need verified flight route options. Does not cover real-time dynamic airline ticket purchase or seat selection.',
      inputSchema: z.object({
        destination: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe(
            'Destination city name or 3-letter IATA code (e.g. Tokyo, TYO, Paris, PAR, Rome, ROM, Reykjavik, KEF)'
          ),
        origin: z
          .string()
          .trim()
          .max(10)
          .optional()
          .describe('Origin airport code (default JFK)'),
        currency: z
          .string()
          .trim()
          .max(10)
          .optional()
          .describe('3-letter currency code (USD, EUR, GBP, JPY, SGD, AUD)'),
        partySize: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe('Number of travelers (default 1)'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const dest = resolveDestination(args.destination);
      if (!dest || !FLIGHTS_DATA[dest.code]) {
        const message = `Destination "${args.destination}" was not found in the ${DATASET.destinationsCount} bundled destinations (Tokyo, Paris, Rome, Reykjavik).`;
        const payload = {
          found: false,
          dataset: 'demo',
          source: 'WanderPulse demo dataset bundled with this app',
          message,
        };
        return {
          isError: true,
          content: [
            { type: 'text', text: message },
            { type: 'text', text: JSON.stringify(payload) },
          ],
          structuredContent: payload,
        };
      }

      const curr = (args.currency || 'USD').toUpperCase();
      const mult = CURRENCY_MULTIPLIERS[curr] || 1;
      const count = args.partySize || 1;

      const flights = FLIGHTS_DATA[dest.code].map((f) => ({
        ...f,
        currency: curr,
        pricePerPerson: Math.round(f.basePrice * mult),
        totalPrice: Math.round(f.basePrice * mult * count),
        partySize: count,
      }));

      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        destination: dest,
        result: flights,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // 2. search_hotels
  server.registerTool(
    'search_hotels',
    {
      title: 'Search Hotels (demo dataset)',
      description:
        'Searches curated hotel accommodations, ratings, neighborhood locations, nightly rates, and amenities from the demo dataset bundled with this app. Use when planning lodging or evaluating stay costs. Does not cover real-time room availability lock or payment processing.',
      inputSchema: z.object({
        destination: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Destination city name (e.g. Tokyo, Paris, Rome, Reykjavik)'),
        nights: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe('Number of nights (default 4)'),
        currency: z
          .string()
          .trim()
          .max(10)
          .optional()
          .describe('3-letter currency code (USD, EUR, GBP, JPY, SGD, AUD)'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const dest = resolveDestination(args.destination);
      if (!dest || !HOTELS_DATA[dest.city]) {
        const message = `City "${args.destination}" was not found in the ${DATASET.destinationsCount} bundled destinations (Tokyo, Paris, Rome, Reykjavik).`;
        const payload = {
          found: false,
          dataset: 'demo',
          source: 'WanderPulse demo dataset bundled with this app',
          message,
        };
        return {
          isError: true,
          content: [
            { type: 'text', text: message },
            { type: 'text', text: JSON.stringify(payload) },
          ],
          structuredContent: payload,
        };
      }

      const curr = (args.currency || 'USD').toUpperCase();
      const mult = CURRENCY_MULTIPLIERS[curr] || 1;
      const numNights = args.nights || 4;

      const hotels = HOTELS_DATA[dest.city].map((h) => ({
        ...h,
        currency: curr,
        pricePerNight: Math.round(h.basePricePerNight * mult),
        totalPrice: Math.round(h.basePricePerNight * mult * numNights),
        nights: numNights,
      }));

      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        destination: dest,
        result: hotels,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // 3. get_weather
  server.registerTool(
    'get_weather',
    {
      title: 'Get Weather Forecast (demo dataset)',
      description:
        'Retrieves multi-day weather conditions, daily temperatures, and precipitation probabilities from the demo dataset bundled with this app. Use when checking destination seasonality or evaluating rain risk for itineraries. Does not cover live radar Doppler telemetry or severe weather emergency alerts.',
      inputSchema: z.object({
        destination: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Destination city name (e.g. Tokyo, Paris, Rome, Reykjavik)'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const dest = resolveDestination(args.destination);
      if (!dest || !WEATHER_DATA[dest.city]) {
        const message = `Weather data for "${args.destination}" was not found in the ${DATASET.destinationsCount} bundled destinations (Tokyo, Paris, Rome, Reykjavik).`;
        const payload = {
          found: false,
          dataset: 'demo',
          source: 'WanderPulse demo dataset bundled with this app',
          message,
        };
        return {
          isError: true,
          content: [
            { type: 'text', text: message },
            { type: 'text', text: JSON.stringify(payload) },
          ],
          structuredContent: payload,
        };
      }

      const forecast = WEATHER_DATA[dest.city];
      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        destination: dest,
        result: forecast,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // 4. get_attractions
  server.registerTool(
    'get_attractions',
    {
      title: 'Get Attractions & Sights (demo dataset)',
      description:
        'Retrieves top-rated sights, cultural experiences, outdoor activities, entrance costs, and covered wet-weather alternatives from the demo dataset bundled with this app. Use when populating itinerary days with anchor activities. Does not cover museum queue times or live ticket reservations.',
      inputSchema: z.object({
        destination: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Destination city name (e.g. Tokyo, Paris, Rome, Reykjavik)'),
        category: z
          .string()
          .trim()
          .max(100)
          .optional()
          .describe('Optional category filter (e.g. Culture, Nature, Culinary, Sightseeing)'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const dest = resolveDestination(args.destination);
      if (!dest || !ATTRACTIONS_DATA[dest.city]) {
        const message = `Attractions for "${args.destination}" were not found in the ${DATASET.destinationsCount} bundled destinations (Tokyo, Paris, Rome, Reykjavik).`;
        const payload = {
          found: false,
          dataset: 'demo',
          source: 'WanderPulse demo dataset bundled with this app',
          message,
        };
        return {
          isError: true,
          content: [
            { type: 'text', text: message },
            { type: 'text', text: JSON.stringify(payload) },
          ],
          structuredContent: payload,
        };
      }

      let list = ATTRACTIONS_DATA[dest.city];
      if (args.category) {
        const cat = args.category.toLowerCase();
        list = list.filter((a) => a.category.toLowerCase().includes(cat));
      }

      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        destination: dest,
        result: list,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // 5. replan_rain
  server.registerTool(
    'replan_rain',
    {
      title: 'Replan Rainy Itinerary Days (demo dataset)',
      description:
        'Switches outdoor activities on forecasted rain days to verified indoor cultural alternatives from the demo dataset bundled with this app. Use when rain probability exceeds threshold and a resilient contingency schedule is needed. Does not cover emergency storm evacuations.',
      inputSchema: z.object({
        destination: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Destination city name (e.g. Tokyo, Paris, Rome, Reykjavik)'),
        rainyDays: z
          .array(z.number().int().min(1).max(10))
          .optional()
          .describe('Array of day numbers to switch to indoor contingencies (default [2, 3])'),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const dest = resolveDestination(args.destination);
      if (!dest || !ATTRACTIONS_DATA[dest.city]) {
        const message = `Replan failed: "${args.destination}" was not found in bundled destinations.`;
        const payload = {
          found: false,
          dataset: 'demo',
          source: 'WanderPulse demo dataset bundled with this app',
          message,
        };
        return {
          isError: true,
          content: [
            { type: 'text', text: message },
            { type: 'text', text: JSON.stringify(payload) },
          ],
          structuredContent: payload,
        };
      }

      const rainyDaySet = new Set(args.rainyDays && args.rainyDays.length > 0 ? args.rainyDays : [2, 3]);
      const baseActs = ATTRACTIONS_DATA[dest.city];

      const replannedDays = [1, 2, 3, 4].map((dayNum) => {
        const isRainy = rainyDaySet.has(dayNum);
        const acts = baseActs.map((act) => {
          if (isRainy && act.isOutdoor && act.rainAlternative) {
            return {
              ...act,
              title: act.rainAlternative.title,
              category: act.rainAlternative.category,
              location: act.rainAlternative.location,
              description: act.rainAlternative.description,
              cost: act.rainAlternative.cost,
              isOutdoor: false,
              weatherSuitability: 'Indoor Verified Contingency',
              contingencySwapped: true,
            };
          }
          return { ...act, contingencySwapped: false };
        });

        return {
          dayNumber: dayNum,
          isRainy,
          activities: acts,
        };
      });

      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        destination: dest,
        result: {
          destination: dest.city,
          replannedDays,
          rainyDays: Array.from(rainyDaySet),
        },
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // 6. get_mcp_status
  server.registerTool(
    'get_mcp_status',
    {
      title: 'Get MCP Status (demo dataset)',
      description:
        'Returns the health, capabilities, server version, and record counts for the WanderPulse Travel Planning MCP server from the demo dataset bundled with this app. Use to verify transport connectivity and protocol readiness. Does not measure external third-party network outages.',
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const payload = {
        found: true,
        dataset: 'demo',
        source: 'WanderPulse demo dataset bundled with this app',
        result: {
          server: SERVER_INFO,
          dataset: DATASET,
          tools: TOOL_NAMES,
          status: 'connected',
          transport: 'streamable-mcp-http',
          protocolVersion: '2025-11-25',
          timestamp: new Date().toISOString(),
        },
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  return server;
}

export async function mcpHandler(req, res) {
  // 1) Verify Origin header if present
  const origin = req.headers['origin'];
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      const reqHost = req.headers['host'];
      const fwdHost = (req.headers['x-forwarded-host'] || '').split(',')[0].trim();
      if (originHost !== reqHost && originHost !== fwdHost) {
        return res.status(403).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Forbidden: Cross-origin request not allowed.',
          },
          id: null,
        });
      }
    } catch (_) {
      return res.status(403).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Forbidden: Invalid Origin header.',
        },
        id: null,
      });
    }
  }

  // 2) On GET without "text/event-stream" in Accept header, return metadata JSON
  const isSse = req.headers['accept']?.includes('text/event-stream');
  if (req.method === 'GET' && !isSse) {
    return res.status(200).json({
      ...SERVER_INFO,
      transport: 'Streamable HTTP (MCP v1.0, protocol 2025-11-25)',
      endpoint: MCP_PATH,
      tools: TOOL_NAMES,
      dataset: DATASET,
      connection: {
        transport: 'streamable-http',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        initializeExample: {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-11-25',
            capabilities: {},
            clientInfo: { name: 'my-client', version: '1.0.0' },
          },
        },
      },
      fetched_at: new Date().toISOString(),
    });
  }

  // 3) On any other method except POST, answer 405 Method Not Allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed. Send MCP messages with POST.',
      },
      id: null,
    });
  }

  // 4) Parse POST body inside try/catch
  let body = req.body;
  try {
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch (parseErr) {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error: Invalid JSON was received by the server.',
      },
      id: null,
    });
  }

  // 5) Build fresh server and transport per request (stateless mode)
  try {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    res.on('close', async () => {
      try {
        await transport.close();
        await server.close();
      } catch (_) {}
    });

    await transport.handleRequest(req, res, body);
  } catch (err) {
    console.error('MCP Handler error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Internal server error: ${err.message}`,
        },
        id: null,
      });
    }
  }
}
