/**
 * App.test.jsx
 * Path: src/__tests__/App.test.jsx
 * Description: App component tests
 * Changes:
 * - L24: Added basic frontend tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.getElementById("root")).toBeDefined();
  });
});
