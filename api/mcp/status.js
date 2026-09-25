import { MCP_SERVERS_INFO } from './data.js';

export default async function handler(req, res) {
  const servers = Object.values(MCP_SERVERS_INFO).map((s) => ({
    ...s,
    latencyMs: Math.floor(s.latencyMs + (Math.random() * 10 - 5)),
    lastSync: new Date().toISOString(),
  }));

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    protocol: 'MCP Streamable Transport v1.0',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    source: 'WanderPulse MCP Server Collection',
    fetched_at: new Date().toISOString(),
    servers,
  });
}
