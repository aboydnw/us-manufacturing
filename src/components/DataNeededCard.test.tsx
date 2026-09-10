import { render, screen } from "@testing-library/react";
import type { Question } from "../data/schema";
import { DataNeededCard } from "./DataNeededCard";

const question: Question = {
  id: "wafer-output",
  stageId: "wafers",
  title: "actual U.S. wafer output",
  missingMeasure: "Annual factory output and utilization",
  usefulSourceWouldInclude: ["facility", "period", "output", "unit", "license"],
  issueLabel: "data-source",
};

it("asks for data without presenting an unknown as zero", () => {
  render(<DataNeededCard question={question} />);
  expect(screen.getByText(/we need data for this/i)).toBeVisible();
  expect(screen.getByText(question.missingMeasure)).toBeVisible();
  expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /suggest a source/i })).toHaveAttribute(
    "href",
    expect.stringContaining("github.com"),
  );
});
