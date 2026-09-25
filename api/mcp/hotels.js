import {
  resolveDestination,
  HOTELS_DATA,
  CURRENCY_MULTIPLIERS,
  DATASET_STATS,
} from '../_lib/travel-data.js';

export default function hotelsHandler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }

  const destinationInput =
    body?.destination || req.query?.destination || 'Tokyo';
  const currency = (body?.currency || req.query?.currency || 'USD').toUpperCase();
  const nights = Number(body?.nights || req.query?.nights || 4);

  const dest = resolveDestination(destinationInput);
  if (!dest || !HOTELS_DATA[dest.city]) {
    return res.status(404).json({
      error: `City "${destinationInput}" was not found in the ${DATASET_STATS.destinationsCount} bundled destinations.`,
      destination: destinationInput,
      hotels: [],
    });
  }

  const mult = CURRENCY_MULTIPLIERS[currency] || 1;
  const hotels = HOTELS_DATA[dest.city].map((h) => ({
    ...h,
    currency,
    pricePerNight: Math.round(h.basePricePerNight * mult),
    totalPrice: Math.round(h.basePricePerNight * mult * nights),
    nights,
  }));

  res.status(200).json({
    status: 'ok',
    destination: dest,
    currency,
    nights,
    hotels,
    source: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
  });
}
