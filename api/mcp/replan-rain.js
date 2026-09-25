import { ATTRACTION_CATALOG, WEATHER_FORECASTS } from './data.js';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const { destination = 'Tokyo', days = [] } = body || {};
  const destStr = String(destination).toLowerCase();

  let matchedCity = 'Tokyo';
  if (destStr.includes('paris')) matchedCity = 'Paris';
  else if (destStr.includes('rome')) matchedCity = 'Rome';
  else if (destStr.includes('reykjavik') || destStr.includes('iceland')) matchedCity = 'Reykjavik';

  const catalog = ATTRACTION_CATALOG[matchedCity] || ATTRACTION_CATALOG.Tokyo;
  let replacementsCount = 0;

  const replannedDays = (Array.isArray(days) ? days : []).map((day) => {
    const isDayRainy = day.forecast?.isRainy || day.forecast?.rainChance > 50;
    if (!isDayRainy) return day;

    const newActivities = (day.activities || []).map((act, actIdx) => {
      if (act.isOutdoor && !act.isAnchorEvent) {
        replacementsCount++;
        const alt = act.rainAlternative || catalog[actIdx % catalog.length]?.rainAlternative;
        if (alt) {
          return {
            ...act,
            title: alt.title,
            category: alt.category || 'Culture',
            location: alt.location || act.location,
            cost: alt.cost != null ? alt.cost : act.cost,
            isOutdoor: false,
            wasReplacedForRain: true,
            originalActivityTitle: act.title,
            description: `${alt.description || 'Covered venue alternative.'} [Wet-weather contingency triggered]`,
          };
        }
      }
      return act;
    });

    return {
      ...day,
      isRainContingencyActive: true,
      activities: newActivities,
    };
  });

  return res.status(200).json({
    status: 'ok',
    destination: matchedCity,
    replacementsCount,
    source: 'WanderPulse Wet-Weather Dynamic Engine (rvibek/smthery + exasearch/exa-mcp)',
    fetched_at: new Date().toISOString(),
    days: replannedDays,
  });
}
