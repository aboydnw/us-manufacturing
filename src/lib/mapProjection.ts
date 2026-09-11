export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ViewportRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type ViewportEdge = "left" | "right" | "top" | "bottom";

export function wrapProjectedX(
  projectedX: number,
  worldSize: number,
  centerX: number,
) {
  if (worldSize <= 0) return projectedX;
  return (
    projectedX + Math.round((centerX - projectedX) / worldSize) * worldSize
  );
}

function inside(point: ScreenPoint, rect: ViewportRect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function placeFlowEndpoint(
  origin: ScreenPoint,
  target: ScreenPoint,
  rect: ViewportRect,
): ScreenPoint & { offscreen: boolean; edge: ViewportEdge | null } {
  if (inside(origin, rect)) {
    return { ...origin, offscreen: false, edge: null };
  }

  const dx = origin.x - target.x;
  const dy = origin.y - target.y;
  const candidates: Array<{ t: number; edge: ViewportEdge }> = [];
  if (dx < 0) candidates.push({ t: (rect.left - target.x) / dx, edge: "left" });
  if (dx > 0)
    candidates.push({ t: (rect.right - target.x) / dx, edge: "right" });
  if (dy < 0) candidates.push({ t: (rect.top - target.y) / dy, edge: "top" });
  if (dy > 0)
    candidates.push({ t: (rect.bottom - target.y) / dy, edge: "bottom" });

  for (const candidate of [...candidates].sort((a, b) => a.t - b.t)) {
    if (candidate.t < 0 || candidate.t > 1) continue;
    const point = {
      x: target.x + dx * candidate.t,
      y: target.y + dy * candidate.t,
    };
    if (inside(point, rect)) {
      return { ...point, offscreen: true, edge: candidate.edge };
    }
  }
  return { ...target, offscreen: true, edge: null };
}

export function resolveLabelCollisions<
  T extends ScreenPoint & { code: string },
>(labels: T[], minimumGap: number): T[] {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  let priorY = Number.NEGATIVE_INFINITY;
  return sorted.map((label) => {
    const y = Math.max(label.y, priorY + minimumGap);
    priorY = y;
    return { ...label, y };
  });
}

const aggregateNames = new Set([
  "rest of world",
  "rest of asia",
  "other",
  "unknown",
  "unknown origin",
]);

export function buildFlowRecords(
  countries: Array<{
    countryCode: string;
    countryName: string;
    value: number | null;
  }>,
) {
  const seen = new Set<string>();
  return countries.flatMap((country) => {
    const aggregate = aggregateNames.has(country.countryName.toLowerCase());
    if (
      country.countryCode === "USA" ||
      aggregate ||
      country.value === null ||
      country.value <= 0 ||
      seen.has(country.countryCode)
    ) {
      return [];
    }
    seen.add(country.countryCode);
    return [
      {
        code: country.countryCode,
        name: country.countryName,
        value: country.value,
      },
    ];
  });
}
