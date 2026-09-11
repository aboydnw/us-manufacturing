import { screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { act } from "react";

vi.mock("riffrec", () => ({
  RiffrecProvider: ({
    children,
    forceEnable,
  }: {
    children: React.ReactNode;
    forceEnable?: boolean;
  }) => (
    <span data-force-enabled={forceEnable ? "true" : "false"}>{children}</span>
  ),
  RiffrecRecorder: () => <button type="button">Record product feedback</button>,
}));

afterEach(() => {
  cleanup();
  document.getElementById("riffrec-root")?.remove();
});

it("mounts the feedback recorder in a separate page root", async () => {
  const { mountDevFeedback } = await import("./devFeedback");

  await act(async () => {
    mountDevFeedback();
  });

  expect(
    screen.getByRole("button", { name: "Record product feedback" }),
  ).toBeInTheDocument();
  expect(document.getElementById("riffrec-root")).not.toBeNull();
  expect(
    screen.getByRole("button", { name: "Record product feedback" })
      .parentElement,
  ).toHaveAttribute("data-force-enabled", "true");
  expect(document.getElementById("riffrec-root")).toHaveStyle({
    position: "fixed",
  });
});

it("enables the feedback recorder for explicitly opted-in preview builds", async () => {
  const { isDevFeedbackEnabled } = await import("./feedbackEnabled");

  expect(isDevFeedbackEnabled(false, "true")).toBe(true);
  expect(isDevFeedbackEnabled(false, undefined)).toBe(false);
  expect(
    isDevFeedbackEnabled(
      false,
      undefined,
      "codex-remove-header-research-methods-us-solar-manufacturing.anthony-personal.workers.dev",
    ),
  ).toBe(true);
  expect(
    isDevFeedbackEnabled(
      false,
      undefined,
      "us-solar-manufacturing.anthony-personal.workers.dev",
    ),
  ).toBe(false);
});
