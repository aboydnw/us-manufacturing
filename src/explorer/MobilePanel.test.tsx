import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { MobilePanel } from "./MobilePanel";

it("cycles the mobile sheet without duplicating its contents", async () => {
  const user = userEvent.setup();
  render(
    <MobilePanel>
      <p>Panel content</p>
    </MobilePanel>,
  );
  const panel = screen.getByTestId("mobile-panel");
  expect(panel).toHaveAttribute("data-sheet-position", "half");
  await user.click(screen.getByRole("button", { name: /expand panel/i }));
  expect(panel).toHaveAttribute("data-sheet-position", "full");
  expect(screen.getAllByText("Panel content")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: /collapse panel/i }));
  expect(panel).toHaveAttribute("data-sheet-position", "peek");
});
