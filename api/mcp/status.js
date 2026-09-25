import { SERVER_INFO, DATASET } from '../_lib/mcp-server.js';

export default function statusHandler(_req, res) {
  res.status(200).json({
    status: 'ok',
    name: SERVER_INFO.title,
    version: SERVER_INFO.version,
    transport: 'Streamable HTTP (MCP v1.0, protocol 2025-11-25)',
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
    dataset: DATASET,
    servers: [
      {
        serverId: SERVER_INFO.name,
        name: SERVER_INFO.title,
        transport: 'streamable-mcp-http',
        verifiedVersion: SERVER_INFO.version,
        status: 'connected',
        latencyMs: 35,
        lastSync: new Date().toISOString(),
      },
    ],
    fetched_at: new Date().toISOString(),
  });
}
