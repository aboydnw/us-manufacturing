import { screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { act } from "react";

vi.mock("riffrec", () => ({
  RiffrecProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
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
});
