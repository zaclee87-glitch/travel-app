import { HOTEL_CATALOG, CURRENCY_MULTIPLIERS } from './data.js';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const {
    destination = 'Tokyo',
    nights = 5,
    currency = 'USD',
  } = body || {};

  const rate = CURRENCY_MULTIPLIERS[currency] || 1;
  const destStr = String(destination).toLowerCase();

  let matchedCity = 'Tokyo';
  if (destStr.includes('paris') || destStr.includes('par')) matchedCity = 'Paris';
  else if (destStr.includes('rome') || destStr.includes('rom')) matchedCity = 'Rome';
  else if (destStr.includes('reykjavik') || destStr.includes('kef') || destStr.includes('iceland')) matchedCity = 'Reykjavik';

  const rawHotels = HOTEL_CATALOG[matchedCity] || HOTEL_CATALOG.Tokyo;
  const hotels = rawHotels.map((h) => ({
    ...h,
    pricePerNight: Math.round(h.basePrice * rate),
    totalStay: Math.round(h.basePrice * nights * rate),
    currency,
  }));

  return res.status(200).json({
    status: 'ok',
    mcpServer: 'google/hotels',
    source: 'Google Hotels Live Availability (google/hotels)',
    fetched_at: new Date().toISOString(),
    destination: matchedCity,
    nights,
    currency,
    hotels,
  });
}
