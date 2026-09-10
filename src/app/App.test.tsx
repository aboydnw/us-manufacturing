import { render, screen } from "@testing-library/react";
import { App } from "./App";

it("introduces the U.S. solar supply-chain question", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /how dependent is a u\.s\. solar installation/i,
    }),
  ).toBeInTheDocument();
});
