import { useEffect, useState } from "react";
import type { SiteData } from "./schema";

type SiteDataState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ready"; data: SiteData; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

function isSiteData(value: unknown): value is SiteData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SiteData>;
  return (
    typeof candidate.generatedAt === "string" &&
    Array.isArray(candidate.sources) &&
    Array.isArray(candidate.stages) &&
    Array.isArray(candidate.observations) &&
    Array.isArray(candidate.questions) &&
    Array.isArray(candidate.facilities) &&
    Array.isArray(candidate.supplyMixes) &&
    Boolean(candidate.referenceSystem)
  );
}

export function useSiteData(): SiteDataState {
  const [state, setState] = useState<SiteDataState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/data/site-data.json", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Unable to load site data: HTTP ${response.status}`);
        }
        const result: unknown = await response.json();
        if (!isSiteData(result)) throw new Error("Invalid site data structure");
        setState({ status: "ready", data: result });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return state;
}
