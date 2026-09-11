import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MapLegend } from "./MapLegend";

it("does not imply a facility layer exists when the stage has no facilities", () => {
  render(<MapLegend facilities={[]} />);
  expect(screen.queryByLabelText(/map legend/i)).toBeNull();
  expect(screen.queryByText(/active u.s. manufacturing facility/i)).toBeNull();
});
