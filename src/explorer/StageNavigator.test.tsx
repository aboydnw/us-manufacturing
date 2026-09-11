import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { stageFixture } from "../test/fixtures";
import { StageNavigator } from "./StageNavigator";

const stages = [
  stageFixture({
    id: "silicon",
    order: 1,
    shortTitle: "Polysilicon",
    technology: "c-si",
  }),
  stageFixture({ id: "wafers", order: 2, shortTitle: "Wafers" }),
  stageFixture({
    id: "cdte",
    order: 3,
    shortTitle: "CdTe branch",
    technology: "cdte",
  }),
];

it("exposes the current stage, branch labels, and next-stage action", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <StageNavigator
      stages={stages}
      activeStageId="silicon"
      expanded={false}
      onExpandedChange={() => undefined}
      onSelect={onSelect}
    />,
  );
  expect(screen.getByText("Crystalline silicon")).toBeInTheDocument();
  expect(screen.getByText("Thin film")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /next: wafers/i }));
  expect(onSelect).toHaveBeenCalledWith("wafers");
});

it("expands for keyboard navigation and selects the focused stage", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  const onExpandedChange = vi.fn();
  render(
    <StageNavigator
      stages={stages}
      activeStageId="silicon"
      expanded
      onExpandedChange={onExpandedChange}
      onSelect={onSelect}
    />,
  );
  const active = screen.getByRole("button", {
    name: /polysilicon, crystalline silicon/i,
  });
  active.focus();
  await user.keyboard("{ArrowRight}{Enter}");
  expect(onSelect).toHaveBeenCalledWith("wafers");
  await user.keyboard("{Escape}");
  expect(onExpandedChange).toHaveBeenCalledWith(false);
});
