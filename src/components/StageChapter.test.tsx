import { render, screen } from "@testing-library/react";
import {
  observationFixture,
  questionFixture,
  stageFixture,
} from "../test/fixtures";
import { StageChapter } from "./StageChapter";

it("renders evidence and questions for a stage", () => {
  render(
    <StageChapter
      stage={stageFixture()}
      observations={[observationFixture()]}
      questions={[questionFixture()]}
      index={2}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Ingots and wafers" }),
  ).toBeVisible();
  expect(screen.getByText(/reported nameplate/i)).toBeVisible();
  expect(screen.getByText(/we need data for this/i)).toBeVisible();
});
