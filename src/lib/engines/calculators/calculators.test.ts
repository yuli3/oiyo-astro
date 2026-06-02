import { differenceInDays, subMonths } from "date-fns";
import { describe, expect, it } from "vitest";

import { calculateAnnualLeaveAllowance } from "./annual-leave-logic";
import { calculateSalary } from "./salary-logic";
import { calculateSeverancePay } from "./severance-pay-logic";

describe("Calculator Logic", () => {
  describe("Annual Leave Calculator", () => {
    it("should calculate allowance correctly for standard case", () => {
      const result = calculateAnnualLeaveAllowance({
        baseSalary: 3000000,
        remainingDays: 5,
        standardMonthlyHours: 209,
        workHoursPerDay: 8,
      });

      const expectedHourly = Math.round(3000000 / 209); // 14354
      const expectedDaily = expectedHourly * 8; // 114832

      expect(result.hourlyWage).toBe(expectedHourly);
      expect(result.dailyWage).toBe(expectedDaily);
      expect(result.totalAllowance).toBe(expectedDaily * 5);
    });

    it("should return 0 for zero inputs", () => {
      const result = calculateAnnualLeaveAllowance({
        baseSalary: 0,
        remainingDays: 5,
      });
      expect(result.totalAllowance).toBe(0);
    });
  });

  describe("Severance Pay Calculator", () => {
    it("should calculate severance pay correctly for >1 year service", () => {
      const hireDate = new Date("2020-01-01");
      const resignationDate = new Date("2023-01-01"); // 3 years exactly
      const baseSalary = 3000000;

      const result = calculateSeverancePay({
        baseSalary,
        hireDate,
        resignationDate,
      });

      expect(result.isEligible).toBe(true);
      expect(result.severancePay).toBeGreaterThan(0);

      // Approx check: 3 years service => roughly 3 months salary
      // 3,000,000 * 3 = 9,000,000
      expect(result.severancePay).toBeGreaterThan(8500000);
      expect(result.severancePay).toBeLessThan(9500000);
    });

    it("should return not eligible for <1 year service", () => {
      const hireDate = new Date("2022-01-01");
      const resignationDate = new Date("2022-06-01"); // 6 months
      const result = calculateSeverancePay({
        baseSalary: 3000000,
        hireDate,
        resignationDate,
      });
      expect(result.isEligible).toBe(false);
      expect(result.error).toBe("less_than_year");
    });
  });

  describe("Salary Calculator", () => {
    it("should calculate net pay correctly", () => {
      const result = calculateSalary({
        annualSalary: 50000000, // 50m krw
        children: 0,
        dependents: 1,
        nonTaxableMonthly: 200000,
      });

      expect(result.monthlyGross).toBeCloseTo(4166667, 0);
      expect(result.netPay).toBeLessThan(result.monthlyGross);
      expect(result.totalDeductions).toBeGreaterThan(0);

      // Check essential deductions exist
      expect(result.pension).toBeGreaterThan(0);
      expect(result.health).toBeGreaterThan(0);
      expect(result.incomeTax).toBeGreaterThan(0);
    });
  });
});
