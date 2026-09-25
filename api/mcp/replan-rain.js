import {
  resolveDestination,
  ATTRACTIONS_DATA,
  DATASET_STATS,
} from '../_lib/travel-data.js';

export default function replanRainHandler(req, res) {
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
  const rainyDaysInput = body?.rainyDays || [2, 3];
  const rainyDaySet = new Set(
    Array.isArray(rainyDaysInput) ? rainyDaysInput : [2, 3]
  );

  const dest = resolveDestination(destinationInput);
  if (!dest || !ATTRACTIONS_DATA[dest.city]) {
    return res.status(404).json({
      error: `Replan failed: "${destinationInput}" was not found in the ${DATASET_STATS.destinationsCount} bundled destinations.`,
      destination: destinationInput,
      replannedDays: [],
    });
  }

  const baseActs = ATTRACTIONS_DATA[dest.city];
  const replannedDays = [1, 2, 3, 4].map((dayNum) => {
    const isRainy = rainyDaySet.has(dayNum);
    const acts = baseActs.map((act) => {
      if (isRainy && act.isOutdoor && act.rainAlternative) {
        return {
          ...act,
          title: act.rainAlternative.title,
          category: act.rainAlternative.category,
          location: act.rainAlternative.location,
          description: act.rainAlternative.description,
          cost: act.rainAlternative.cost,
          isOutdoor: false,
          weatherSuitability: 'Indoor Contingency',
          contingencySwapped: true,
        };
      }
      return { ...act, contingencySwapped: false };
    });

    return {
      dayNumber: dayNum,
      isRainy,
      activities: acts,
    };
  });

  res.status(200).json({
    status: 'ok',
    destination: dest,
    rainyDays: Array.from(rainyDaySet),
    replannedDays,
    source: 'WanderPulse Travel Planning MCP (bundled demo dataset)',
  });
}
