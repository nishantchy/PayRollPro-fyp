interface TaxSlab {
  minAmount: number;
  maxAmount: number;
  rate: number;
}

interface TaxCalculation {
  taxableIncome: number;
  taxAmount: number;
  breakdown: {
    slab: TaxSlab;
    amount: number;
    tax: number;
  }[];
}

export class TaxCalculator {
  private static readonly TAX_SLABS: TaxSlab[] = [
    { minAmount: 0, maxAmount: 500000, rate: 0.01 }, // 1% for first 5 lakhs
    { minAmount: 500000, maxAmount: 700000, rate: 0.1 }, // 10% for next 2 lakhs
    { minAmount: 700000, maxAmount: 1000000, rate: 0.2 }, // 20% for next 3 lakhs
    { minAmount: 1000000, maxAmount: 2000000, rate: 0.3 }, // 30% for next 10 lakhs
    { minAmount: 2000000, maxAmount: Infinity, rate: 0.36 }, // 36% for above 20 lakhs
  ];

  /**
   * Find tax slab using binary search
   * Time Complexity: O(log n) where n is number of tax slabs
   * Space Complexity: O(1)
   */
  private static findTaxSlab(income: number): TaxSlab {
    let left = 0;
    let right = this.TAX_SLABS.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const currentSlab = this.TAX_SLABS[mid];

      if (income >= currentSlab.minAmount && income <= currentSlab.maxAmount) {
        return currentSlab;
      }

      if (income < currentSlab.minAmount) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // If income is above all slabs, return the last slab
    return this.TAX_SLABS[this.TAX_SLABS.length - 1];
  }

  /**
   * Calculate tax using binary search for slab finding
   */
  public static calculateTax(income: number): TaxCalculation {
    const breakdown: { slab: TaxSlab; amount: number; tax: number }[] = [];
    let totalTax = 0;
    let remainingIncome = income;

    // Find all applicable slabs using binary search
    while (remainingIncome > 0) {
      const slab = this.findTaxSlab(remainingIncome);
      const taxableAmount = Math.min(
        remainingIncome - slab.minAmount,
        slab.maxAmount - slab.minAmount
      );

      if (taxableAmount > 0) {
        const tax = taxableAmount * slab.rate;
        breakdown.push({
          slab,
          amount: taxableAmount,
          tax,
        });
        totalTax += tax;
        remainingIncome -= taxableAmount;
      } else {
        break;
      }
    }

    return {
      taxableIncome: income,
      taxAmount: totalTax,
      breakdown,
    };
  }

  /**
   * Optimize salary structure to minimize tax burden
   * Uses dynamic programming to find optimal salary components
   */
  public static optimizeSalaryStructure(
    totalSalary: number,
    components: { name: string; maxPercentage: number }[]
  ): { component: string; amount: number; taxBenefit: number }[] {
    // Create DP table
    // dp[i][j] represents maximum tax benefit for first i components with j amount
    const dp: number[][] = Array(components.length + 1)
      .fill(0)
      .map(() => Array(totalSalary + 1).fill(0));

    // Track decisions
    const decisions: number[][] = Array(components.length + 1)
      .fill(0)
      .map(() => Array(totalSalary + 1).fill(0));

    // Fill DP table
    for (let i = 1; i <= components.length; i++) {
      const component = components[i - 1];
      const maxAmount = Math.floor(totalSalary * component.maxPercentage);

      for (let j = 0; j <= totalSalary; j++) {
        // Don't use this component
        dp[i][j] = dp[i - 1][j];
        decisions[i][j] = 0;

        // Try using this component
        if (j >= maxAmount) {
          const taxBenefit = this.calculateTaxBenefit(maxAmount);
          const value = dp[i - 1][j - maxAmount] + taxBenefit;

          if (value > dp[i][j]) {
            dp[i][j] = value;
            decisions[i][j] = maxAmount;
          }
        }
      }
    }

    // Reconstruct solution
    const result: { component: string; amount: number; taxBenefit: number }[] =
      [];
    let remainingAmount = totalSalary;

    for (let i = components.length; i > 0; i--) {
      const amount = decisions[i][remainingAmount];
      if (amount > 0) {
        result.push({
          component: components[i - 1].name,
          amount,
          taxBenefit: this.calculateTaxBenefit(amount),
        });
        remainingAmount -= amount;
      }
    }

    return result;
  }

  /**
   * Calculate tax benefit for a given amount
   * This is a simplified calculation - in reality, it would consider
   * various tax exemptions and deductions
   */
  private static calculateTaxBenefit(amount: number): number {
    const taxCalculation = this.calculateTax(amount);
    return taxCalculation.taxAmount * 0.5; // Assuming 50% of tax can be saved through optimization
  }
}
