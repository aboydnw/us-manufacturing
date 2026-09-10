import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useSiteData } from "./useSiteData";

afterEach(() => vi.unstubAllGlobals());

it("reports invalid generated data as an error", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ observations: "invalid" }),
    }),
  );

  const { result } = renderHook(() => useSiteData());
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.error?.message).toMatch(/invalid/i);
});

it("reports an unsuccessful response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

  const { result } = renderHook(() => useSiteData());
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.error?.message).toContain("404");
});
