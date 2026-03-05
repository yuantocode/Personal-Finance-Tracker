import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders finance dashboard title", () => {
  render(<App />);
  expect(screen.getByText(/finance dashboard/i)).toBeInTheDocument();
});