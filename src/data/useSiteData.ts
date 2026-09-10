import { useEffect, useState } from "react";
import { SiteDataSchema, type SiteData } from "./schema";

type SiteDataState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ready"; data: SiteData; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

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
        const result = SiteDataSchema.safeParse(await response.json());
        if (!result.success) {
          throw new Error(`Invalid site data: ${result.error.message}`);
        }
        setState({ status: "ready", data: result.data });
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
