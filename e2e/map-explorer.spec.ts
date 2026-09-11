import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { SiteData } from "../src/data/schema";

const screenshotDir = resolve("docs/screenshots/map-redesign");
mkdirSync(screenshotDir, { recursive: true });
const siteData = JSON.parse(
  readFileSync(resolve("public/data/site-data.json"), "utf8"),
) as SiteData;

async function waitForExplorer(page: Page) {
  await expect(
    page.getByRole("navigation", { name: "Solar manufacturing stages" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Solar supply map" }),
  ).toBeVisible();
  await page.waitForFunction(
    () =>
      Boolean(
        (
          window as unknown as {
            __solarMap?: { isStyleLoaded(): boolean };
          }
        ).__solarMap?.isStyleLoaded(),
      ) || document.body.textContent?.includes("Interactive map unavailable"),
  );
  const fallbackVisible = await page
    .getByText("Interactive map unavailable")
    .isVisible()
    .catch(() => false);
  if (!fallbackVisible) {
    await expect
      .poll(
        async () =>
          (await page.locator(".maplibregl-canvas").boundingBox())?.height,
      )
      .toBeGreaterThan(400);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                __solarMap: {
                  queryRenderedFeatures(options: {
                    layers: string[];
                  }): unknown[];
                };
              }
            ).__solarMap.queryRenderedFeatures({ layers: ["countries-fill"] })
              .length,
        ),
      )
      .toBeGreaterThan(0);
  }
}

test.describe("desktop explorer", () => {
  test.skip(({ isMobile }) => Boolean(isMobile));

  test("captures overview, facilities, facility detail, and global geography", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForExplorer(page);
    await page.screenshot({
      path: resolve(screenshotDir, "desktop-overview.png"),
      fullPage: true,
    });

    await page
      .getByRole("button", { name: "Polysilicon, Crystalline silicon" })
      .click();
    await page.keyboard.press("Escape");
    await page.getByRole("tab", { name: /U.S. facilities/ }).click();
    await page.screenshot({
      path: resolve(screenshotDir, "desktop-facilities.png"),
      fullPage: true,
    });

    await page
      .getByRole("list", { name: "U.S. facilities" })
      .getByRole("button", { name: /Hemlock Semiconductor/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "Hemlock Semiconductor" }),
    ).toBeVisible();
    await page.screenshot({
      path: resolve(screenshotDir, "desktop-facility-detail.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "Global" }).click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: resolve(screenshotDir, "desktop-global.png"),
      fullPage: true,
    });
  });

  test("captures a selected country from a compatible fixture series", async ({
    page,
  }) => {
    const fixture = structuredClone(siteData);
    fixture.supplyMixes = [
      {
        id: "module-supply-fixture",
        stageId: "modules",
        product: "Crystalline-silicon modules",
        geography: "US market",
        period: "2025",
        measure: "actual-supply",
        unit: "GWdc",
        denominatorValue: 100,
        sourceId: fixture.sources[0].source_id,
        completeness: "complete",
        limitation:
          "Test-only compatible series. Direct origin does not reveal upstream origin.",
        countries: [
          {
            countryCode: "USA",
            countryName: "United States",
            value: 30,
            originType: "direct",
          },
          {
            countryCode: "CHN",
            countryName: "China",
            value: 50,
            originType: "direct",
          },
          {
            countryCode: "VNM",
            countryName: "Vietnam",
            value: 15,
            originType: "direct",
          },
        ],
        unknownOriginValue: 5,
        source: fixture.sources[0],
      },
    ];
    await page.route("**/data/site-data.json", (route) =>
      route.fulfill({ json: fixture }),
    );
    await page.goto("/");
    await waitForExplorer(page);
    await page
      .getByRole("button", { name: "Modules, Crystalline silicon" })
      .click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /China, 50%/ }).click();
    await expect(page.getByRole("heading", { name: "China" })).toBeVisible();
    await page.screenshot({
      path: resolve(screenshotDir, "desktop-country-detail.png"),
      fullPage: true,
    });
  });
});

test.describe("mobile explorer", () => {
  test.skip(({ isMobile }) => !isMobile);

  test("captures overview and selected facility in the shared bottom sheet", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForExplorer(page);
    await page.screenshot({
      path: resolve(screenshotDir, "mobile-overview.png"),
      fullPage: true,
    });

    await page
      .getByRole("button", { name: "Polysilicon, Crystalline silicon" })
      .click();
    await page.keyboard.press("Escape");
    await page.getByRole("tab", { name: /U.S. facilities/ }).click();
    await page
      .getByRole("list", { name: "U.S. facilities" })
      .getByRole("button", { name: /Hemlock Semiconductor/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "Hemlock Semiconductor" }),
    ).toBeVisible();
    await page.screenshot({
      path: resolve(screenshotDir, "mobile-facility-detail.png"),
      fullPage: true,
    });
  });
});
