/**
 * Salary (Tax) Calculation Logic (Korea 2025)
 */

export interface SalaryInput {
  annualSalary: number;
  children: number; // Children under 20 (for tax credit)
  dependents: number;
  nonTaxableMonthly: number;
}

export interface SalaryResultSummary {
  care: number;
  emp: number;
  health: number;
  incomeTax: number;
  localTax: number;
  monthlyGross: number;
  netPay: number;
  pension: number;
  totalDeductions: number;
}

// 2025 Estimated Constants (Korea Specific)
const PENSION_RATE = 0.045;
const PENSION_MAX_MONTHLY_INCOME = 6170000; // Cap base
const HEALTH_RATE = 0.03545;
const CARE_RATE = 0.1295; // % of Health
const EMP_RATE = 0.009;

// Simple Income Tax Bracket (Yearly Tax Base) - Korea 2025
const TAX_BRACKETS = [
  { deduction: 0, limit: 14000000, rate: 0.06 },
  { deduction: 1260000, limit: 50000000, rate: 0.15 },
  { deduction: 5760000, limit: 88000000, rate: 0.24 },
  { deduction: 15440000, limit: 150000000, rate: 0.35 },
  { deduction: 19940000, limit: 300000000, rate: 0.38 },
  { deduction: 25940000, limit: 500000000, rate: 0.4 },
  { deduction: 35940000, limit: 1000000000, rate: 0.42 },
  { deduction: 65940000, limit: Infinity, rate: 0.45 },
];

export function calculateSalary(input: SalaryInput): SalaryResultSummary {
  const { annualSalary, children, dependents, nonTaxableMonthly } = input;

  if (!annualSalary) {
    return {
      care: 0,
      emp: 0,
      health: 0,
      incomeTax: 0,
      localTax: 0,
      monthlyGross: 0,
      netPay: 0,
      pension: 0,
      totalDeductions: 0,
    };
  }

  const monthlyGross = annualSalary / 12;
  const monthlyTaxable = monthlyGross - nonTaxableMonthly;

  // 1. National Pension
  // Note: Min base 390,000 is also a constant but mostly relevant for very low income.
  const pensionBase = Math.min(
    Math.max(monthlyTaxable, 390000),
    PENSION_MAX_MONTHLY_INCOME,
  );
  const pension = Math.floor((pensionBase * PENSION_RATE) / 10) * 10;

  // 2. Health Insurance
  const health = Math.floor((monthlyTaxable * HEALTH_RATE) / 10) * 10;

  // 3. Long-term Care
  const care = Math.floor((health * CARE_RATE) / 10) * 10;

  // 4. Employment Insurance
  const emp = Math.floor((monthlyTaxable * EMP_RATE) / 10) * 10;

  // 5. Income Tax (Simplified approximation using yearly logic / 12)
  // Earned Income Deduction
  let earnedDeduction = 0;
  const totalSalary = annualSalary - nonTaxableMonthly * 12;

  if (totalSalary <= 5000000) earnedDeduction = totalSalary * 0.7;
  else if (totalSalary <= 15000000)
    earnedDeduction = 3500000 + (totalSalary - 5000000) * 0.4;
  else if (totalSalary <= 45000000)
    earnedDeduction = 7500000 + (totalSalary - 15000000) * 0.15;
  else if (totalSalary <= 100000000)
    earnedDeduction = 12000000 + (totalSalary - 45000000) * 0.05;
  else earnedDeduction = 14750000 + (totalSalary - 100000000) * 0.02;
  if (earnedDeduction > 20000000) earnedDeduction = 20000000; // Capped at 20m

  // Personal Deduction
  const personalDeduction = dependents * 1500000; // Basic

  const taxBase = Math.max(
    0,
    totalSalary - earnedDeduction - personalDeduction,
  );

  // Apply Rates
  let annualTax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxBase <= bracket.limit) {
      annualTax = taxBase * bracket.rate - bracket.deduction;
      break;
    }
  }

  // Tax Credit (Simplified)
  let taxCredit = annualTax * 0.55;
  if (totalSalary > 70000000) taxCredit = Math.min(taxCredit, 660000);
  else taxCredit = Math.min(taxCredit, 740000);

  // Children tax credit - simplified assumption (150,000 per child)
  taxCredit += children * 150000;

  annualTax = Math.max(0, annualTax - taxCredit);

  const incomeTax = Math.floor(annualTax / 12 / 10) * 10;
  const localTax = Math.floor((incomeTax * 0.1) / 10) * 10;

  const totalDeductions = pension + health + care + emp + incomeTax + localTax;
  const netPay = Math.floor(monthlyGross - totalDeductions);

  return {
    care,
    emp,
    health,
    incomeTax,
    localTax,
    monthlyGross,
    netPay,
    pension,
    totalDeductions,
  };
}
