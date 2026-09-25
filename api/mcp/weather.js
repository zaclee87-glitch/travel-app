import {
  resolveDestination,
  WEATHER_DATA,
  DATASET_STATS,
} from '../_lib/travel-data.js';

export default function weatherHandler(req, res) {
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
  const dest = resolveDestination(destinationInput);

  if (!dest || !WEATHER_DATA[dest.city]) {
    return res.status(404).json({
      error: `Weather data for "${destinationInput}" was not found in the ${DATASET_STATS.destinationsCount} bundled destinations.`,
      destination: destinationInput,
      forecast: [],
    });
  }

  res.status(200).json({
    status: 'ok',
    destination: dest,
    forecast: WEATHER_DATA[dest.city],
    source: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
  });
}
