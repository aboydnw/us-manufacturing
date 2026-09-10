import { render, screen } from "@testing-library/react";
import { EvidenceBadge } from "./EvidenceBadge";

it("labels nameplate capacity without calling it production", () => {
  render(<EvidenceBadge type="nameplate" />);
  expect(screen.getByText("Reported nameplate")).toBeVisible();
  expect(screen.queryByText("Production")).not.toBeInTheDocument();
});

it("gives unknown evidence an explicit data-needed label", () => {
  render(<EvidenceBadge type="unknown" />);
  expect(screen.getByText("Data needed")).toBeVisible();
});
