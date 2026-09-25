import {
  resolveDestination,
  FLIGHTS_DATA,
  CURRENCY_MULTIPLIERS,
  DATASET_STATS,
} from '../_lib/travel-data.js';

export default function flightsHandler(req, res) {
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
  const partySize = Number(body?.partySize || req.query?.partySize || 1);

  const dest = resolveDestination(destinationInput);
  if (!dest || !FLIGHTS_DATA[dest.code]) {
    return res.status(404).json({
      error: `Destination "${destinationInput}" was not found in the ${DATASET_STATS.destinationsCount} bundled destinations.`,
      destination: destinationInput,
      flights: [],
    });
  }

  const mult = CURRENCY_MULTIPLIERS[currency] || 1;
  const flights = FLIGHTS_DATA[dest.code].map((f) => ({
    ...f,
    currency,
    price: Math.round(f.basePrice * mult),
    pricePerPerson: Math.round(f.basePrice * mult),
    totalPrice: Math.round(f.basePrice * mult * partySize),
    partySize,
  }));

  res.status(200).json({
    status: 'ok',
    destination: dest,
    currency,
    partySize,
    flights,
    source: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
  });
}
