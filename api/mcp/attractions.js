import {
  resolveDestination,
  ATTRACTIONS_DATA,
  DATASET_STATS,
} from '../_lib/travel-data.js';

export default function attractionsHandler(req, res) {
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
  const category = (body?.category || req.query?.category || '').toLowerCase();

  const dest = resolveDestination(destinationInput);
  if (!dest || !ATTRACTIONS_DATA[dest.city]) {
    return res.status(404).json({
      error: `Attractions for "${destinationInput}" were not found in the ${DATASET_STATS.destinationsCount} bundled destinations.`,
      destination: destinationInput,
      attractions: [],
    });
  }

  let list = ATTRACTIONS_DATA[dest.city];
  if (category) {
    list = list.filter((a) => a.category.toLowerCase().includes(category));
  }

  res.status(200).json({
    status: 'ok',
    destination: dest,
    attractions: list,
    source: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
  });
}
