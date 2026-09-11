import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Geometry, Point } from "geojson";
import type { ResolvedFacility, ResolvedSupplyMix } from "../data/schema";
import { facilityRadius } from "../lib/facilityMeasures";
import {
  buildFlowRecords,
  placeFlowEndpoint,
  resolveLabelCollisions,
  wrapProjectedX,
} from "../lib/mapProjection";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const US_BOUNDS: [[number, number], [number, number]] = [
  [-128, 20],
  [-61, 53],
];

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    countries: { type: "geojson", data: "/data/countries.geojson" },
    states: { type: "geojson", data: "/data/us-states.geojson" },
  },
  layers: [
    {
      id: "water",
      type: "background",
      paint: { "background-color": "#dce8ed" },
    },
    {
      id: "countries-fill",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#f5f3ec", "fill-opacity": 0.96 },
    },
    {
      id: "selected-country",
      type: "fill",
      source: "countries",
      filter: ["==", ["get", "code"], ""],
      paint: { "fill-color": "#f2c84b", "fill-opacity": 0.5 },
    },
    {
      id: "country-lines",
      type: "line",
      source: "countries",
      paint: { "line-color": "#8d9aa0", "line-width": 0.7 },
    },
    {
      id: "state-lines",
      type: "line",
      source: "states",
      paint: { "line-color": "#b8c1c3", "line-width": 0.7 },
    },
  ],
};

interface Props {
  facilities: ResolvedFacility[];
  supplyMix: ResolvedSupplyMix | null;
  selectedCountryCode: string | null;
  selectedFacilityId: string | null;
  geographyView: "us" | "global";
  onGeographyChange: (view: "us" | "global") => void;
  onSelectCountry: (code: string) => void;
  onSelectFacility: (id: string) => void;
}

interface CountryFeatureProperties {
  code: string;
  name: string;
}

interface ProjectedFlow {
  code: string;
  name: string;
  value: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  offscreen: boolean;
}

function facilityGeoJson(
  facilities: ResolvedFacility[],
): FeatureCollection<Point> {
  const maxValue = Math.max(
    1,
    ...facilities.map((facility) => facility.measureValue ?? 0),
  );
  return {
    type: "FeatureCollection",
    features: facilities.map((facility) => ({
      type: "Feature",
      id: facility.id,
      properties: {
        id: facility.id,
        name: facility.name,
        measureValue: facility.measureValue ?? 0,
        hasMeasure: facility.measureValue !== null,
        markerRadius: facilityRadius(facility.measureValue, maxValue),
      },
      geometry: {
        type: "Point",
        coordinates: [facility.longitude, facility.latitude],
      },
    })),
  };
}

function geometryAnchor(geometry: Geometry) {
  const points: Array<[number, number]> = [];
  function visit(value: unknown) {
    if (!Array.isArray(value)) return;
    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      points.push([value[0], value[1]]);
      return;
    }
    value.forEach(visit);
  }
  if ("coordinates" in geometry) visit(geometry.coordinates);
  if (!points.length) return null;
  return {
    longitude: points.reduce((sum, point) => sum + point[0], 0) / points.length,
    latitude: points.reduce((sum, point) => sum + point[1], 0) / points.length,
  };
}

function facilityLabel(facility: ResolvedFacility) {
  const measure =
    facility.measureValue === null
      ? "value unavailable"
      : `${facility.measureValue.toLocaleString()} ${facility.measureUnit}`;
  return `${facility.name}, ${measure}`;
}

export function SupplyMap({
  facilities,
  supplyMix,
  selectedCountryCode,
  selectedFacilityId,
  geographyView,
  onGeographyChange,
  onSelectCountry,
  onSelectFacility,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectFacilityRef = useRef(onSelectFacility);
  selectFacilityRef.current = onSelectFacility;
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [countryAnchors, setCountryAnchors] = useState(
    new Map<string, { longitude: number; latitude: number }>(),
  );
  const [projectedFlows, setProjectedFlows] = useState<ProjectedFlow[]>([]);
  const facilitiesGeoJson = useMemo(
    () => facilityGeoJson(facilities),
    [facilities],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) {
      setMapUnavailable(true);
      return;
    }

    const map = new maplibregl.Map({
      container,
      style: mapStyle,
      bounds: US_BOUNDS,
      fitBoundsOptions: { padding: 28 },
      minZoom: 1,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-left",
    );
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "Made with Natural Earth · U.S. Census Bureau",
      }),
      "bottom-right",
    );
    map.on("load", () => {
      map.addSource("facilities", { type: "geojson", data: facilitiesGeoJson });
      map.addLayer({
        id: "facility-circles",
        type: "circle",
        source: "facilities",
        paint: {
          "circle-radius": ["get", "markerRadius"],
          "circle-color": ["case", ["get", "hasMeasure"], "#1769a6", "#ffffff"],
          "circle-opacity": 0.82,
          "circle-stroke-color": "#0c3e64",
          "circle-stroke-width": [
            "case",
            ["==", ["get", "id"], selectedFacilityId ?? ""],
            3,
            1.3,
          ],
        },
      });
      map.on("click", "facility-circles", (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) selectFacilityRef.current(id);
      });
      map.on("mouseenter", "facility-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "facility-circles", () => {
        map.getCanvas().style.cursor = "";
      });
      (window as unknown as { __solarMap?: maplibregl.Map }).__solarMap = map;
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((response) => response.json())
      .then(
        (collection: FeatureCollection<Geometry, CountryFeatureProperties>) => {
          setCountryAnchors(
            new Map(
              collection.features.flatMap((feature) => {
                const anchor = geometryAnchor(feature.geometry);
                return anchor
                  ? [[feature.properties.code, anchor] as const]
                  : [];
              }),
            ),
          );
        },
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("facilities") as GeoJSONSource | undefined;
    source?.setData(facilitiesGeoJson);
  }, [facilitiesGeoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setFilter("selected-country", [
      "==",
      ["get", "code"],
      selectedCountryCode ?? "",
    ]);
    map.setPaintProperty("facility-circles", "circle-stroke-width", [
      "case",
      ["==", ["get", "id"], selectedFacilityId ?? ""],
      3,
      1.3,
    ]);
  }, [selectedCountryCode, selectedFacilityId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (geographyView === "global") {
      map.flyTo({ center: [0, 22], zoom: 1.25, essential: false });
    } else {
      map.fitBounds(US_BOUNDS, { padding: 28, duration: 500 });
    }
  }, [geographyView]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !supplyMix) {
      setProjectedFlows([]);
      return;
    }
    const activeMap = map;
    const records = buildFlowRecords(supplyMix.countries);
    function update() {
      const width = activeMap.getContainer().clientWidth;
      const height = activeMap.getContainer().clientHeight;
      const target = activeMap.project([-98.58, 39.83]);
      const worldSize = 512 * 2 ** activeMap.getZoom();
      const flows = records.flatMap((record) => {
        const anchor = countryAnchors.get(record.code);
        if (!anchor) return [];
        const raw = activeMap.project([anchor.longitude, anchor.latitude]);
        const endpoint = placeFlowEndpoint(
          {
            x: wrapProjectedX(raw.x, worldSize, width / 2),
            y: raw.y,
          },
          target,
          { left: 28, top: 28, right: width - 28, bottom: height - 40 },
        );
        return [
          {
            ...record,
            x: endpoint.x,
            y: endpoint.y,
            targetX: target.x,
            targetY: target.y,
            offscreen: endpoint.offscreen,
          },
        ];
      });
      const resolved = resolveLabelCollisions(
        flows.map((flow) => ({ ...flow, code: flow.code })),
        26,
      );
      setProjectedFlows(resolved);
    }
    update();
    activeMap.on("move", update);
    activeMap.on("resize", update);
    return () => {
      activeMap.off("move", update);
      activeMap.off("resize", update);
    };
  }, [countryAnchors, supplyMix]);

  return (
    <section className="supply-map" role="region" aria-label="Solar supply map">
      <div ref={containerRef} className="supply-map__canvas" />
      <MapControls value={geographyView} onChange={onGeographyChange} />
      <MapLegend facilities={facilities} />
      {mapUnavailable ? (
        <div className="supply-map__fallback">
          <strong>Interactive map unavailable</strong>
          <p>You can still inspect every facility in this stage.</p>
          <ul>
            {facilities.map((facility) => (
              <li key={facility.id}>
                <button
                  type="button"
                  onClick={() => onSelectFacility(facility.id)}
                >
                  {facilityLabel(facility)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul
          className="map-accessible-facilities"
          aria-label="Mapped facilities"
        >
          {facilities.map((facility) => (
            <li key={facility.id}>
              <button
                type="button"
                onClick={() => onSelectFacility(facility.id)}
              >
                {facilityLabel(facility)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {projectedFlows.length ? (
        <svg className="supply-map__flows" aria-hidden="true">
          {projectedFlows.map((flow) => {
            const controlX = (flow.x + flow.targetX) / 2;
            const controlY = Math.min(flow.y, flow.targetY) - 70;
            return (
              <path
                key={flow.code}
                d={`M ${flow.x} ${flow.y} Q ${controlX} ${controlY} ${flow.targetX} ${flow.targetY}`}
              />
            );
          })}
        </svg>
      ) : null}
      <div className="supply-map__flow-labels">
        {projectedFlows.map((flow) => (
          <button
            key={flow.code}
            type="button"
            style={{ left: flow.x, top: flow.y }}
            onClick={() => onSelectCountry(flow.code)}
          >
            {flow.name}
            {flow.offscreen ? (
              <span className="sr-only">, offscreen</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
