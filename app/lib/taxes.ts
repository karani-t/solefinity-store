/**
 * Kenya Tax & Currency Utilities
 * Handles VAT, Excise Duty, and currency formatting
 */

export enum TaxType {
  VAT = "VAT", // 16% - Standard VAT
  EXCISE_DUTY = "EXCISE_DUTY", // For specific goods like alcohol, cigarettes
  WITHHOLDING = "WITHHOLDING", // 5% - Withholding tax
}

export class KenyaTaxCalculator {
  // Kenya Revenue Authority (KRA) tax rates
  private taxRates = {
    VAT: 0.16, // 16% standard VAT
    EXCISE_DUTY: {
      alcohol: 0.2, // 20% for alcoholic beverages
      cigarettes: 0.3, // 30% for cigarettes
      fuel: 0.08, // 8% for fuel/energy
    },
    WITHHOLDING: 0.05, // 5% withholding tax
  };

  /**
   * Calculate VAT amount
   * VAT is calculated on the net price (before VAT)
   */
  calculateVAT(netPriceKES: number, taxRate: number = this.taxRates.VAT): number {
    return Number((netPriceKES * taxRate).toFixed(2));
  }

  /**
   * Calculate total price with VAT
   */
  calculateTotalWithVAT(
    netPriceKES: number,
    taxRate: number = this.taxRates.VAT
  ): { netPrice: number; taxAmount: number; totalPrice: number } {
    const taxAmount = this.calculateVAT(netPriceKES, taxRate);
    return {
      netPrice: Number(netPriceKES.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalPrice: Number((netPriceKES + taxAmount).toFixed(2)),
    };
  }

  /**
   * Calculate excise duty based on product category
   */
  calculateExciseDuty(
    netPriceKES: number,
    category: "alcohol" | "cigarettes" | "fuel"
  ): { netPrice: number; excieDuty: number; totalPrice: number } {
    const exciseRate = this.taxRates.EXCISE_DUTY[category];
    const excieDuty = Number((netPriceKES * exciseRate).toFixed(2));

    return {
      netPrice: Number(netPriceKES.toFixed(2)),
      excieDuty,
      totalPrice: Number((netPriceKES + excieDuty).toFixed(2)),
    };
  }

  /**
   * Calculate withholding tax (used for supplier payments)
   */
  calculateWithholdingTax(amountKES: number): {
    grossAmount: number;
    withholding: number;
    netAmount: number;
  } {
    const withholding = Number((amountKES * this.taxRates.WITHHOLDING).toFixed(2));

    return {
      grossAmount: Number(amountKES.toFixed(2)),
      withholding,
      netAmount: Number((amountKES - withholding).toFixed(2)),
    };
  }

  /**
   * Calculate profit margin with tax
   */
  calculateMargin(
    costPriceKES: number,
    sellingPriceKES: number,
    taxRate: number = this.taxRates.VAT
  ): {
    costPrice: number;
    sellingPrice: number;
    grossMarginKES: number;
    grossMarginPercent: number;
    netMarginAfterTaxKES: number;
    netMarginPercent: number;
  } {
    const grossMargin = sellingPriceKES - costPriceKES;
    const grossMarginPercent = (grossMargin / costPriceKES) * 100;

    // Net margin accounts for tax paid
    const taxAmount = this.calculateVAT(sellingPriceKES, taxRate);
    const netMargin = grossMargin - taxAmount;
    const netMarginPercent = (netMargin / costPriceKES) * 100;

    return {
      costPrice: Number(costPriceKES.toFixed(2)),
      sellingPrice: Number(sellingPriceKES.toFixed(2)),
      grossMarginKES: Number(grossMargin.toFixed(2)),
      grossMarginPercent: Number(grossMarginPercent.toFixed(2)),
      netMarginAfterTaxKES: Number(netMargin.toFixed(2)),
      netMarginPercent: Number(netMarginPercent.toFixed(2)),
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amountKES: number, showKES = true): string {
    const formatted = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountKES);

    return showKES ? formatted : formatted.replace("KES", "").trim();
  }

  /**
   * Parse currency string to number
   */
  parseCurrency(currencyString: string): number {
    const cleaned = currencyString
      .replace(/KES|Ksh|Rs/gi, "")
      .replace(/,/g, "")
      .trim();
    return parseFloat(cleaned) || 0;
  }

  /**
   * Round to nearest 10 KES (common for pricing)
   */
  roundToPricePoint(priceKES: number, roundTo: number = 10): number {
    return Math.round(priceKES / roundTo) * roundTo;
  }

  /**
   * Apply discount
   */
  applyDiscount(
    priceKES: number,
    discountPercent: number
  ): { originalPrice: number; discountAmount: number; finalPrice: number } {
    const discountAmount = Number((priceKES * (discountPercent / 100)).toFixed(2));
    const finalPrice = Number((priceKES - discountAmount).toFixed(2));

    return {
      originalPrice: Number(priceKES.toFixed(2)),
      discountAmount,
      finalPrice,
    };
  }

  /**
   * Calculate bulk discount pricing for distributors
   */
  calculateBulkDiscount(
    unitPriceKES: number,
    quantity: number
  ): { unitPrice: number; quantity: number; bulkPrice: number; discountPercent: number } {
    let discountPercent = 0;

    if (quantity >= 100) discountPercent = 15;
    else if (quantity >= 50) discountPercent = 10;
    else if (quantity >= 20) discountPercent = 5;

    const bulkPrice = Number(
      (unitPriceKES * (1 - discountPercent / 100)).toFixed(2)
    );

    return {
      unitPrice: Number(unitPriceKES.toFixed(2)),
      quantity,
      bulkPrice,
      discountPercent,
    };
  }
}

/**
 * Currency exchange utils (USD to KES conversion reference)
 * Note: In production, use real-time API
 */
export class CurrencyExchange {
  private static USD_TO_KES_RATE = 130; // Current approximate rate

  /**
   * Convert USD to KES
   */
  static usdToKes(usdAmount: number): number {
    return Number((usdAmount * this.USD_TO_KES_RATE).toFixed(2));
  }

  /**
   * Convert KES to USD
   */
  static kesToUsd(kesAmount: number): number {
    return Number((kesAmount / this.USD_TO_KES_RATE).toFixed(2));
  }

  /**
   * Update exchange rate (for real-time updates)
   */
  static updateRate(newRate: number) {
    this.USD_TO_KES_RATE = newRate;
  }
}

// Create singleton instances
export const taxCalculator = new KenyaTaxCalculator();