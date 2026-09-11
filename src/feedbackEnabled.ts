export function isDevFeedbackEnabled(
  isDevelopment: boolean,
  optIn?: string,
  hostname?: string,
) {
  return (
    isDevelopment ||
    optIn === "true" ||
    hostname?.endsWith(
      "-us-solar-manufacturing.anthony-personal.workers.dev",
    ) === true
  );
}
