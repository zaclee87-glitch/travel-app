import { FLIGHT_CATALOG, CURRENCY_MULTIPLIERS } from './data.js';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const {
    origin = 'JFK',
    destination = 'HND',
    currency = 'USD',
    partySize = 1,
  } = body || {};

  const rate = CURRENCY_MULTIPLIERS[currency] || 1;
  const destUpper = String(destination).toUpperCase();

  let matchedCode = 'TYO';
  if (destUpper.includes('PAR') || destUpper.includes('CDG')) matchedCode = 'PAR';
  else if (destUpper.includes('ROM') || destUpper.includes('FCO')) matchedCode = 'ROM';
  else if (destUpper.includes('KEF') || destUpper.includes('REYKJAVIK')) matchedCode = 'KEF';
  else if (destUpper.includes('TYO') || destUpper.includes('HND') || destUpper.includes('NRT')) matchedCode = 'TYO';

  const rawFlights = FLIGHT_CATALOG[matchedCode] || FLIGHT_CATALOG.TYO;
  const flights = rawFlights.map((f) => ({
    ...f,
    price: Math.round(f.basePrice * rate),
    currency,
    partySize,
  }));

  return res.status(200).json({
    status: 'ok',
    mcpServer: '@gvzq/flight-mcp',
    source: 'Smithery Flight Pricing Engine (@gvzq/flight-mcp)',
    fetched_at: new Date().toISOString(),
    origin,
    destination: matchedCode,
    currency,
    partySize,
    flights,
  });
}
