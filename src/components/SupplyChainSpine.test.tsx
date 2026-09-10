import { render, screen } from "@testing-library/react";
import type { Stage } from "../data/schema";
import { SupplyChainSpine } from "./SupplyChainSpine";

const stages: Stage[] = [
  {
    id: "cells",
    order: 3,
    technology: "c-si",
    title: "Solar cells",
    shortTitle: "Cells",
    summary: "Wafers become cells.",
    inputs: ["wafer"],
    outputs: ["cell"],
  },
  {
    id: "cdte",
    order: 9,
    technology: "cdte",
    title: "CdTe comparison",
    shortTitle: "CdTe branch",
    summary: "Thin films use another route.",
    inputs: ["glass"],
    outputs: ["module"],
  },
];

it("keeps crystalline silicon and CdTe stages distinct", () => {
  render(<SupplyChainSpine stages={stages} />);
  expect(screen.getByRole("navigation", { name: /supply chain/i })).toBeVisible();
  expect(screen.getByText("Crystalline silicon")).toBeVisible();
  expect(screen.getByText("CdTe comparison")).toBeVisible();
});

it("links every stage to its chapter", () => {
  render(<SupplyChainSpine stages={stages} />);
  expect(screen.getByRole("link", { name: /cells/i })).toHaveAttribute(
    "href",
    "#cells",
  );
});
