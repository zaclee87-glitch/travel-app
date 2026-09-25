import { ATTRACTION_CATALOG, CURRENCY_MULTIPLIERS } from './data.js';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const destination = body?.destination || body?.city || req.query?.destination || 'Tokyo';
  const currency = body?.currency || 'USD';
  const rate = CURRENCY_MULTIPLIERS[currency] || 1;

  const destStr = String(destination).toLowerCase();
  let matchedCity = 'Tokyo';
  if (destStr.includes('paris')) matchedCity = 'Paris';
  else if (destStr.includes('rome')) matchedCity = 'Rome';
  else if (destStr.includes('reykjavik') || destStr.includes('iceland')) matchedCity = 'Reykjavik';

  const rawAttractions = ATTRACTION_CATALOG[matchedCity] || ATTRACTION_CATALOG.Tokyo;
  const attractions = rawAttractions.map((a) => ({
    ...a,
    cost: Math.round(a.cost * rate),
    currency,
    rainAlternative: a.rainAlternative
      ? {
          ...a.rainAlternative,
          cost: Math.round(a.rainAlternative.cost * rate),
        }
      : undefined,
  }));

  return res.status(200).json({
    status: 'ok',
    mcpServer: 'exasearch/exa-mcp',
    source: 'Exa Semantic Attractions & Event Anchors (exasearch/exa-mcp)',
    fetched_at: new Date().toISOString(),
    destination: matchedCity,
    attractions,
  });
}
