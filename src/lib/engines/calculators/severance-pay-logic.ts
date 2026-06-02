import { differenceInDays, subMonths } from "date-fns";

/**
 * Severance Pay Calculation Logic
 */

export interface SeverancePayInput {
  annualBonus?: number; // Annual bonus (total for the year)
  annualLeaveAllowance?: number; // Unused annual leave allowance (total for the year)
  baseSalary: number; // Monthly base salary
  hireDate: Date;
  resignationDate: Date;
}

export interface SeverancePayResult {
  averageDailyWage: number;
  error?: string;
  isEligible: boolean;
  serviceDays: number;
  severancePay: number;
}

export function calculateSeverancePay(
  input: SeverancePayInput,
): SeverancePayResult {
  const {
    annualBonus = 0,
    annualLeaveAllowance = 0,
    baseSalary,
    hireDate,
    resignationDate,
  } = input;

  // Validate dates
  if (hireDate >= resignationDate) {
    return {
      averageDailyWage: 0,
      error: "invalid_dates",
      isEligible: false,
      serviceDays: 0,
      severancePay: 0,
    };
  }

  const threeMonthsAgo = subMonths(resignationDate, 3);

  // Total calendar days in the last 3 months
  const last3MonthsDays = differenceInDays(resignationDate, threeMonthsAgo);

  // Calculate 3 months wages
  // Monthly salary * 3
  // Bonus & Leave allowance is prorated (3/12)
  const threeMonthsTotal =
    baseSalary * 3 + ((annualBonus + annualLeaveAllowance) * 3) / 12;

  const avgDailyWage = threeMonthsTotal / last3MonthsDays; // Average Daily Wage

  // Total Service Days
  const serviceDays = differenceInDays(resignationDate, hireDate);

  if (serviceDays < 365) {
    return {
      averageDailyWage: avgDailyWage,
      error: "less_than_year",
      isEligible: false,
      serviceDays,
      severancePay: 0,
    };
  }

  // Severance = Avg Daily Wage * 30 * (Service Days / 365)
  const severance = avgDailyWage * 30 * (serviceDays / 365);

  return {
    averageDailyWage: avgDailyWage,
    isEligible: true,
    serviceDays,
    severancePay: Math.round(severance),
  };
}
