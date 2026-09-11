import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importCensusTrade } from "./import-census-trade";

interface BuildEnvironment {
  CENSUS_API_KEY?: string;
  CENSUS_IMPORT_YEAR?: string;
}

export function censusImportYearForBuild(
  environment: BuildEnvironment,
  now = new Date(),
) {
  if (!environment.CENSUS_API_KEY?.trim()) return null;

  const explicitYear = environment.CENSUS_IMPORT_YEAR?.trim();
  if (explicitYear) {
    if (!/^\d{4}$/.test(explicitYear)) {
      throw new Error("CENSUS_IMPORT_YEAR must use YYYY format");
    }
    return explicitYear;
  }

  return String(now.getUTCFullYear() - 1);
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";
if (
  invokedFile &&
  pathToFileURL(invokedFile).href === pathToFileURL(currentFile).href
) {
  const year = censusImportYearForBuild(process.env);
  if (year) {
    console.log(`Refreshing Census country imports for ${year}...`);
    await importCensusTrade(
      resolve(dirname(currentFile), ".."),
      year,
      process.env.CENSUS_API_KEY ?? "",
    );
  } else {
    console.log(
      "CENSUS_API_KEY is not configured; using the checked-in country-import snapshot.",
    );
  }
}
