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
  T extends ScreenPoint & { code: string; edge?: ViewportEdge | null },
>(
  labels: T[],
  minimumGap: number,
  bounds?: { top: number; bottom: number },
): T[] {
  const groups = new Map<string, T[]>();
  for (const label of labels) {
    const key = label.edge ?? `point:${Math.round(label.x / minimumGap)}`;
    groups.set(key, [...(groups.get(key) ?? []), label]);
  }
  return [...groups.values()].flatMap((group) => {
    const sorted = [...group].sort((a, b) => a.y - b.y);
    const effectiveGap = bounds
      ? Math.min(
          minimumGap,
          sorted.length > 1
            ? (bounds.bottom - bounds.top) / (sorted.length - 1)
            : minimumGap,
        )
      : minimumGap;
    const ys = sorted.map((label, index) =>
      Math.max(
        bounds
          ? Math.min(bounds.bottom, Math.max(bounds.top, label.y))
          : label.y,
        index ? (sorted[index - 1]?.y ?? label.y) + effectiveGap : label.y,
      ),
    );
    for (let index = 1; index < ys.length; index += 1) {
      ys[index] = Math.max(ys[index]!, ys[index - 1]! + effectiveGap);
    }
    if (bounds && ys.length && ys.at(-1)! > bounds.bottom) {
      ys[ys.length - 1] = bounds.bottom;
      for (let index = ys.length - 2; index >= 0; index -= 1) {
        ys[index] = Math.max(
          bounds.top,
          Math.min(ys[index]!, ys[index + 1]! - effectiveGap),
        );
      }
    }
    return sorted.map((label, index) => ({ ...label, y: ys[index]! }));
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
