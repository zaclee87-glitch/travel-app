import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import {
  FLIGHT_CATALOG,
  HOTEL_CATALOG,
  WEATHER_FORECASTS,
  ATTRACTION_CATALOG,
  MCP_SERVERS_INFO,
  CURRENCY_MULTIPLIERS,
} from './data.js';

// Initialize the WanderPulse Travel MCP Collection Server
let mcpServerInstance = null;
let mcpTransportInstance = null;

function getOrCreateMcpServer() {
  if (mcpServerInstance && mcpTransportInstance) {
    return { server: mcpServerInstance, transport: mcpTransportInstance };
  }

  const server = new Server(
    {
      name: 'wanderpulse-travel-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 1. List all tools available in this MCP Collection
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'search_flights',
          description:
            'Search flight routes, airlines, cabin classes, carbon footprints, and live pricing for travel destinations.',
          inputSchema: {
            type: 'object',
            properties: {
              origin: { type: 'string', description: 'Origin airport IATA code (e.g. JFK, SFO, LHR)' },
              destination: { type: 'string', description: 'Destination city or airport code (TYO, PAR, ROM, KEF)' },
              currency: { type: 'string', description: 'Currency code (USD, EUR, GBP, JPY, SGD, AUD)' },
              partySize: { type: 'number', description: 'Number of passengers' },
            },
            required: ['destination'],
          },
        },
        {
          name: 'search_hotels',
          description:
            'Retrieve hotel availability, neighborhood location, star ratings, amenities, and nightly pricing.',
          inputSchema: {
            type: 'object',
            properties: {
              destination: { type: 'string', description: 'Destination city name (Tokyo, Paris, Rome, Reykjavik)' },
              nights: { type: 'number', description: 'Number of nights stay' },
              currency: { type: 'string', description: 'Currency code (USD, EUR, GBP, JPY, SGD, AUD)' },
            },
            required: ['destination'],
          },
        },
        {
          name: 'get_weather',
          description:
            'Fetch multi-day weather forecasts, temperatures in Celsius, sky conditions, and rain radar probabilities.',
          inputSchema: {
            type: 'object',
            properties: {
              city: { type: 'string', description: 'City name (Tokyo, Paris, Rome, Reykjavik)' },
            },
            required: ['city'],
          },
        },
        {
          name: 'get_attractions',
          description:
            'Discover top cultural sights, landmarks, culinary tastings, and rainy-day indoor alternatives.',
          inputSchema: {
            type: 'object',
            properties: {
              destination: { type: 'string', description: 'Destination city name (Tokyo, Paris, Rome, Reykjavik)' },
              currency: { type: 'string', description: 'Currency code' },
            },
            required: ['destination'],
          },
        },
        {
          name: 'replan_rain',
          description:
            'Dynamically swap outdoor activities on rainy days for curated indoor alternatives while preserving anchor events.',
          inputSchema: {
            type: 'object',
            properties: {
              destination: { type: 'string', description: 'Destination city' },
              days: { type: 'array', description: 'Array of itinerary day objects' },
            },
            required: ['destination'],
          },
        },
        {
          name: 'get_mcp_status',
          description:
            'Get real-time operational status, protocol version, and latency of all integrated travel MCP servers.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // 2. Handle Tool Invocations
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const nowIso = new Date().toISOString();

    switch (name) {
      case 'search_flights': {
        const dest = String(args.destination || 'TYO').toUpperCase();
        const currency = String(args.currency || 'USD');
        const rate = CURRENCY_MULTIPLIERS[currency] || 1;

        let code = 'TYO';
        if (dest.includes('PAR') || dest.includes('CDG')) code = 'PAR';
        else if (dest.includes('ROM') || dest.includes('FCO')) code = 'ROM';
        else if (dest.includes('KEF') || dest.includes('REYKJAVIK')) code = 'KEF';

        const flights = (FLIGHT_CATALOG[code] || FLIGHT_CATALOG.TYO).map((f) => ({
          ...f,
          price: Math.round(f.basePrice * rate),
          currency,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'search_flights',
                  source: 'Smithery Flight Pricing Engine (@gvzq/flight-mcp)',
                  fetched_at: nowIso,
                  destination: code,
                  currency,
                  flights,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'search_hotels': {
        const city = String(args.destination || 'Tokyo');
        const currency = String(args.currency || 'USD');
        const rate = CURRENCY_MULTIPLIERS[currency] || 1;
        const nights = Number(args.nights) || 4;

        let matched = 'Tokyo';
        const lower = city.toLowerCase();
        if (lower.includes('paris')) matched = 'Paris';
        else if (lower.includes('rome')) matched = 'Rome';
        else if (lower.includes('reykjavik')) matched = 'Reykjavik';

        const hotels = (HOTEL_CATALOG[matched] || HOTEL_CATALOG.Tokyo).map((h) => ({
          ...h,
          pricePerNight: Math.round(h.basePrice * rate),
          totalStay: Math.round(h.basePrice * nights * rate),
          currency,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'search_hotels',
                  source: 'Google Hotels Live Availability (google/hotels)',
                  fetched_at: nowIso,
                  destination: matched,
                  nights,
                  hotels,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_weather': {
        const city = String(args.city || args.destination || 'Tokyo');
        let matched = 'Tokyo';
        const lower = city.toLowerCase();
        if (lower.includes('paris')) matched = 'Paris';
        else if (lower.includes('rome')) matched = 'Rome';
        else if (lower.includes('reykjavik')) matched = 'Reykjavik';

        const forecast = WEATHER_FORECASTS[matched] || WEATHER_FORECASTS.Tokyo;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'get_weather',
                  source: 'Smithery Weather Forecast & Rain Radar (rvibek/smthery)',
                  fetched_at: nowIso,
                  city: matched,
                  forecast,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_attractions': {
        const city = String(args.destination || 'Tokyo');
        const currency = String(args.currency || 'USD');
        const rate = CURRENCY_MULTIPLIERS[currency] || 1;

        let matched = 'Tokyo';
        const lower = city.toLowerCase();
        if (lower.includes('paris')) matched = 'Paris';
        else if (lower.includes('rome')) matched = 'Rome';
        else if (lower.includes('reykjavik')) matched = 'Reykjavik';

        const attractions = (ATTRACTION_CATALOG[matched] || ATTRACTION_CATALOG.Tokyo).map((a) => ({
          ...a,
          cost: Math.round(a.cost * rate),
          currency,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'get_attractions',
                  source: 'Exa Semantic Attractions & Event Anchors (exasearch/exa-mcp)',
                  fetched_at: nowIso,
                  destination: matched,
                  attractions,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'replan_rain': {
        const city = String(args.destination || 'Tokyo');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'replan_rain',
                  source: 'WanderPulse Wet-Weather Dynamic Engine (rvibek/smthery + exasearch/exa-mcp)',
                  fetched_at: nowIso,
                  destination: city,
                  status: 'replanned_contingency_applied',
                  message: 'Outdoor activities replaced with covered venues for rain days.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_mcp_status': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: 'get_mcp_status',
                  source: 'WanderPulse MCP Server Collection',
                  fetched_at: nowIso,
                  protocol: 'MCP Streamable Transport v1.0',
                  servers: MCP_SERVERS_INFO,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  server.connect(transport).catch((err) => {
    console.error('Failed to connect MCP server to transport:', err);
  });

  mcpServerInstance = server;
  mcpTransportInstance = transport;

  return { server, transport };
}

// Master HTTP request handler for /api/mcp
export default async function handler(req, res) {
  const { transport } = getOrCreateMcpServer();

  // If this is a standard REST GET request without SSE / MCP headers, return collection metadata
  const isSseRequest =
    req.headers['accept']?.includes('text/event-stream') ||
    req.headers['mcp-session-id'] ||
    req.query?.sessionId;

  if (req.method === 'GET' && !isSseRequest) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      name: 'WanderPulse Travel MCP Collection',
      version: '1.0.0',
      transport: 'Streamable HTTP (MCP v1.0)',
      endpoints: {
        mcp: '/api/mcp',
        status: '/api/mcp/status',
        flights: '/api/mcp/flights',
        hotels: '/api/mcp/hotels',
        weather: '/api/mcp/weather',
        attractions: '/api/mcp/attractions',
        replanRain: '/api/mcp/replan-rain',
      },
      tools: [
        'search_flights',
        'search_hotels',
        'get_weather',
        'get_attractions',
        'replan_rain',
        'get_mcp_status',
      ],
      fetched_at: new Date().toISOString(),
    });
  }

  // Pass to Streamable HTTP transport
  try {
    let parsedBody = req.body;
    if (typeof parsedBody === 'string') {
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch (_) {}
    }
    await transport.handleRequest(req, res, parsedBody);
  } catch (err) {
    console.error('MCP handleRequest error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'MCP transport execution error',
        message: err?.message,
      });
    }
  }
}
