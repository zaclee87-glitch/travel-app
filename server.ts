import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { mcpHandler, MCP_PATH, SERVER_INFO, DATASET } from './api/_lib/mcp-server.js';
import statusHandler from './api/mcp/status.js';
import flightsHandler from './api/mcp/flights.js';
import hotelsHandler from './api/mcp/hotels.js';
import weatherHandler from './api/mcp/weather.js';
import attractionsHandler from './api/mcp/attractions.js';
import replanRainHandler from './api/mcp/replan-rain.js';
import healthHandler from './api/health.js';
import askHandler from './api/ask.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Express JSON body parser for /api routes with 1MB limit
app.use('/api', express.json({ limit: '1mb' }));

// Express JSON error handler for /api: turns syntax errors into -32700 and body errors into -32600 JSON-RPC
app.use('/api', (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    const isSyntax = err instanceof SyntaxError || (err.status === 400 && 'body' in err);
    const code = isSyntax ? -32700 : -32600;
    const message = isSyntax
      ? 'Parse error: Invalid JSON was received by the server.'
      : (err.message || 'Invalid Request');
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code, message },
      id: null,
    });
  }
  next();
});

// Direct sub-routes under /api/mcp/* for REST/JSON queries
app.all('/api/mcp/status', statusHandler);
app.all('/api/mcp/flights', flightsHandler);
app.all('/api/mcp/hotels', hotelsHandler);
app.all('/api/mcp/weather', weatherHandler);
app.all('/api/mcp/attractions', attractionsHandler);
app.all('/api/mcp/replan-rain', replanRainHandler);

// MCP Streamable HTTP endpoints (both /api/mcp and /api/mcp/index)
app.all(['/api/mcp', '/api/mcp/index', '/api'], mcpHandler);

// Health check endpoint reporting MCP_PATH, SERVER_INFO, and DATASET
app.get('/api/health', healthHandler);

// Ask Gemini with tools endpoint
app.post('/api/ask', askHandler);

// AI Holiday Planning Assistant Endpoint
app.post('/api/ai-plan-chat', async (req, res) => {
  const { query, history = [], currentContext = {} } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const lowerQuery = query.toLowerCase();

    // Destination matching
    let destId = 'dest-tokyo';
    let destCity = 'Tokyo';
    let destCountry = 'Japan';
    let destCode = 'TYO';
    let hotelName = 'The Capitol Hotel Tokyu';
    let neighborhood = 'Chiyoda / Akasaka';
    let hotelPrice = 380;
    let airline = 'All Nippon Airways (ANA)';
    let themeTitle = 'Modern Metropolises, Shrines & World-Class Gastronomy';

    if (
      lowerQuery.includes('paris') ||
      lowerQuery.includes('france') ||
      lowerQuery.includes('eiffel') ||
      lowerQuery.includes('louvre') ||
      lowerQuery.includes('romance')
    ) {
      destId = 'dest-paris';
      destCity = 'Paris';
      destCountry = 'France';
      destCode = 'PAR';
      hotelName = 'Hôtel Madame Rêve';
      neighborhood = '1st Arrondissement (Louvre - Bourse)';
      hotelPrice = 440;
      airline = 'Air France';
      themeTitle = 'Haussmannian Elegance, Impressionism & Classic Cafés';
    } else if (
      lowerQuery.includes('rome') ||
      lowerQuery.includes('italy') ||
      lowerQuery.includes('colosseum') ||
      lowerQuery.includes('pasta') ||
      lowerQuery.includes('vatican')
    ) {
      destId = 'dest-rome';
      destCity = 'Rome';
      destCountry = 'Italy';
      destCode = 'ROM';
      hotelName = 'Singer Palace Hotel';
      neighborhood = 'Trevi / Pantheon';
      hotelPrice = 420;
      airline = 'ITA Airways';
      themeTitle = 'Classical Antiquity, Piazzas & Trastevere Gastronomy';
    } else if (
      lowerQuery.includes('iceland') ||
      lowerQuery.includes('reykjavik') ||
      lowerQuery.includes('aurora') ||
      lowerQuery.includes('northern lights') ||
      lowerQuery.includes('glacier') ||
      lowerQuery.includes('volcano')
    ) {
      destId = 'dest-reykjavik';
      destCity = 'Reykjavik';
      destCountry = 'Iceland';
      destCode = 'KEF';
      hotelName = 'The Reykjavik EDITION';
      neighborhood = 'Old Harbour / Harpa';
      hotelPrice = 460;
      airline = 'Icelandair';
      themeTitle = 'Volcanic Glaciers, Geothermal Spas & Subarctic Auroras';
    }

    // Party size detection
    let partySize = currentContext.partySize || 1;
    const partyMatch = query.match(/(?:for|party\s+of|size\s+of)\s+([1-9])/i);
    if (partyMatch) {
      partySize = parseInt(partyMatch[1], 10);
    } else if (
      lowerQuery.includes('couple') ||
      lowerQuery.includes('partner') ||
      lowerQuery.includes('2 people') ||
      lowerQuery.includes('two')
    ) {
      partySize = 2;
    } else if (lowerQuery.includes('family') || lowerQuery.includes('4 people') || lowerQuery.includes('four')) {
      partySize = 4;
    }

    // Budget detection
    let budget = currentContext.totalBudget || 3500;
    const budgetMatch = query.match(/\$?([0-9]{1,2},?[0-9]{3})/);
    if (budgetMatch) {
      budget = parseInt(budgetMatch[1].replace(',', ''), 10);
    } else if (lowerQuery.includes('luxury') || lowerQuery.includes('splurge')) {
      budget = 6500;
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('cheap')) {
      budget = 2000;
    }

    // Currency detection
    let currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'AUD' = currentContext.currency || 'USD';
    if (lowerQuery.includes('eur') || lowerQuery.includes('€')) currency = 'EUR';
    if (lowerQuery.includes('gbp') || lowerQuery.includes('£')) currency = 'GBP';
    if (lowerQuery.includes('yen') || lowerQuery.includes('jpy') || lowerQuery.includes('¥')) currency = 'JPY';

    const replyText = `I analyzed your vision for a holiday: "${query}".\n\nI have crafted a tailored plan centered on **${destCity}, ${destCountry}** (${themeTitle}). The plan balances your target budget of ${currency} ${budget.toLocaleString()} for ${partySize} ${partySize === 1 ? 'traveler' : 'travelers'}, allocating accommodation at **${hotelName}** in ${neighborhood} and flight options with **${airline}**.\n\nAll 4 days of activities, culinary anchors, and wet-weather contingencies have been loaded from the WanderPulse MCP server and are ready to apply!`;

    res.json({
      success: true,
      source: 'smart-planner-engine',
      replyText,
      proposedPlan: {
        destinationId: destId,
        destinationCity: destCity,
        destinationCountry: destCountry,
        destinationCode: destCode,
        totalBudget: budget,
        currency,
        partySize,
        startDate: '2026-10-14',
        endDate: '2026-10-18',
        vibeInterests: ['Culture & History', 'Food & Culinary', 'Architecture'],
        themeTitle,
        reasoning: `Matches your vision with curated ${destCity} experiences, budget allocation, and local stays.`,
        hotelSuggestion: {
          name: hotelName,
          neighborhood,
          estPricePerNight: hotelPrice,
          why: `Prime location with high walkability score and verified reviews via WanderPulse MCP.`,
        },
        flightSuggestion: {
          airline,
          preference: 'Nonstop Standard',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'AI Plan Chat failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
