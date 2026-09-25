import { MCP_PATH, SERVER_INFO, DATASET } from './_lib/mcp-server.js';

export default function healthHandler(_req, res) {
  res.status(200).json({
    status: 'ok',
    mcpPath: MCP_PATH,
    serverInfo: SERVER_INFO,
    dataset: DATASET,
    timestamp: new Date().toISOString(),
  });
}
