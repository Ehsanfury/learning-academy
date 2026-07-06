/**
 * xpCalculator.test.js
 * Path: backend/tests/unit/utils/xpCalculator.test.js
 * Description: XP calculator unit tests
 */

import { describe, it, expect } from "@jest/globals";
import {
  calculateLevel,
  calculatePotentialXP,
  calculateEarnedXP,
} from "../../../utils/xpCalculator.js";

describe("XP Calculator", () => {
  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 2 for 100 XP", () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it("should return level 3 for 250 XP", () => {
      expect(calculateLevel(250)).toBe(3);
    });

    it("should handle negative XP", () => {
      expect(calculateLevel(-10)).toBe(1);
    });
  });

  describe("calculatePotentialXP", () => {
    it("should calculate XP for perfect score", () => {
      const baseXP = 50;
      const score = 100;
      const isPerfect = true;
      const bonusXP = 25;

      const result = calculatePotentialXP(baseXP, score, isPerfect, bonusXP);
      expect(result).toBe(75);
    });

    it("should calculate XP for high score", () => {
      const baseXP = 50;
      const score = 80;
      const isPerfect = false;
      const bonusXP = 25;

      const result = calculatePotentialXP(baseXP, score, isPerfect, bonusXP);
      expect(result).toBe(40);
    });

    it("should calculate XP for low score", () => {
      const baseXP = 50;
      const score = 30;
      const isPerfect = false;
      const bonusXP = 25;

      const result = calculatePotentialXP(baseXP, score, isPerfect, bonusXP);
      expect(result).toBe(15);
    });
  });

  describe("calculateEarnedXP", () => {
    it("should return difference when new XP is higher", () => {
      const newXP = 75;
      const previousXP = 50;

      const result = calculateEarnedXP(newXP, previousXP);
      expect(result).toBe(25);
    });

    it("should return 0 when new XP is lower", () => {
      const newXP = 50;
      const previousXP = 75;

      const result = calculateEarnedXP(newXP, previousXP);
      expect(result).toBe(0);
    });

    it("should return 0 when new XP is equal", () => {
      const newXP = 50;
      const previousXP = 50;

      const result = calculateEarnedXP(newXP, previousXP);
      expect(result).toBe(0);
    });
  });
});
