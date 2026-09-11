import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MapLegend } from "./MapLegend";

it("does not imply a facility layer exists when the stage has no facilities", () => {
  render(<MapLegend facilities={[]} />);
  expect(screen.getByText(/no mapped u.s. facilities/i)).toBeVisible();
  expect(screen.queryByText(/active u.s. manufacturing facility/i)).toBeNull();
});
