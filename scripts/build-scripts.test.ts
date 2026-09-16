import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

interface PackageManifest {
  scripts: Record<string, string>;
}

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as PackageManifest;

it("compiles the checked-in data snapshot without refreshing external data", () => {
  expect(manifest.scripts.build).toContain("corepack yarn data:compile");
  expect(manifest.scripts.build).not.toContain("data:prepare-build");
  expect(manifest.scripts["data:prepare-build"]).toBeDefined();
});
