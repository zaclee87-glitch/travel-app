import { WEATHER_FORECASTS } from './data.js';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const city = body?.city || body?.destination || req.query?.city || 'Tokyo';
  const cityStr = String(city).toLowerCase();

  let matchedCity = 'Tokyo';
  if (cityStr.includes('paris')) matchedCity = 'Paris';
  else if (cityStr.includes('rome')) matchedCity = 'Rome';
  else if (cityStr.includes('reykjavik') || cityStr.includes('iceland')) matchedCity = 'Reykjavik';

  const forecast = WEATHER_FORECASTS[matchedCity] || WEATHER_FORECASTS.Tokyo;

  return res.status(200).json({
    status: 'ok',
    mcpServer: 'rvibek/smthery',
    source: 'Smithery Weather Forecast & Rain Radar (rvibek/smthery)',
    fetched_at: new Date().toISOString(),
    city: matchedCity,
    forecast,
  });
}
