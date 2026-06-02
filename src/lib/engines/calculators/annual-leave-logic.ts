/**
 * Annual Leave Allowance Calculation Logic
 */

export interface AnnualLeaveInput {
  baseSalary: number; // Monthly fixed salary
  remainingDays: number;
  standardMonthlyHours?: number; // Default 209 (Korea standard for 40h week)
  workHoursPerDay?: number; // Default 8
}

export interface AnnualLeaveResult {
  dailyWage: number;
  hourlyWage: number;
  totalAllowance: number;
}

export function calculateAnnualLeaveAllowance(
  input: AnnualLeaveInput,
): AnnualLeaveResult {
  const {
    baseSalary,
    remainingDays,
    standardMonthlyHours = 209,
    workHoursPerDay = 8,
  } = input;

  if (baseSalary <= 0 || remainingDays <= 0) {
    return { dailyWage: 0, hourlyWage: 0, totalAllowance: 0 };
  }

  const hourlyWage = Math.round(baseSalary / standardMonthlyHours);
  const dailyWage = hourlyWage * workHoursPerDay;
  const totalAllowance = dailyWage * remainingDays;

  return {
    dailyWage,
    hourlyWage,
    totalAllowance,
  };
}
