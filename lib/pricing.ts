/**
 * Trvel.co Pricing Rules
 *
 * Priority:
 * 1. Start with 60% markup over wholesale (base price)
 * 2. If base price > competitor cost: discount down to 10% under competitor
 * 3. But never go below 50% minimum margin
 * 4. Round to nearest .99 or .49 (whichever is closer, rounding down)
 */

// Minimum margin multiplier (50% markup = 1.5x wholesale)
const MINIMUM_MARGIN_MULTIPLIER = 1.5;

// Target discount vs competitor (10% under)
const COMPETITOR_DISCOUNT = 0.90;

/**
 * Round price to nearest .99 or .49 (whichever is closer, rounding down)
 */
export function roundToFriendlyPrice(price: number, currency: string): number {
  // For IDR, round to nearest 1000 with 900 ending
  if (currency === 'IDR') {
    const thousands = Math.floor(price / 1000);
    // Round down to nearest .9k (e.g., 149,900)
    return (thousands * 1000) + 900;
  }

  // Get the integer part and decimal part
  const integerPart = Math.floor(price);
  const decimal = price - integerPart;

  // Determine whether .49 or .99 is closer (rounding down)
  if (decimal < 0.49) {
    // Round down to previous .99 or use current .49
    if (integerPart > 0) {
      return integerPart - 0.01; // e.g., 45.30 -> 44.99
    }
    return 0.49;
  } else if (decimal < 0.99) {
    // Use .49 for this integer
    return integerPart + 0.49;
  } else {
    // Already close to .99
    return integerPart + 0.99;
  }
}

/**
 * Calculate retail price using the Trvel pricing formula
 *
 * Priority:
 * 1. Start with 60% markup over wholesale (base price)
 * 2. If base price > competitor cost: discount down to 10% under competitor
 * 3. But never go below 50% minimum margin
 *
 * @param wholesaleCostLocal - Wholesale cost in local currency
 * @param competitorDailyRate - Competitor's daily roaming rate in local currency
 * @param planDuration - Duration in days (5, 7, or 15)
 * @param currency - Currency code (AUD, SGD, GBP, MYR, IDR)
 * @returns Retail price in local currency
 */
export function calculateRetailPrice(
  wholesaleCostLocal: number,
  competitorDailyRate: number,
  planDuration: number,
  currency: string
): number {
  // Step 1: Base price (60% markup - the default)
  const basePrice = wholesaleCostLocal * 1.60;

  // Competitor trip cost
  const competitorTripCost = competitorDailyRate * planDuration;

  // Target price (10% under competitor - max discount we offer)
  const targetPrice = competitorTripCost * COMPETITOR_DISCOUNT;

  // Minimum margin floor (50% markup)
  const floorPrice = wholesaleCostLocal * MINIMUM_MARGIN_MULTIPLIER;

  // Determine final pre-round price
  let finalPreRoundPrice: number;

  if (basePrice <= competitorTripCost) {
    // Base price is already at or below competitor - use base price
    finalPreRoundPrice = basePrice;
  } else {
    // Base price is above competitor - try to discount
    // Offer up to 10% savings vs competitor, but not below 50% margin
    finalPreRoundPrice = Math.max(targetPrice, floorPrice);
  }

  // Customer-friendly rounding
  return roundToFriendlyPrice(finalPreRoundPrice, currency);
}

/**
 * Calculate pricing details with breakdown for debugging/logging
 */
export interface PricingBreakdown {
  wholesaleCostLocal: number;
  competitorDailyRate: number;
  planDuration: number;
  competitorTripCost: number;
  targetPrice: number;
  marginAtTarget: number;
  usedTargetPrice: boolean;
  preRoundPrice: number;
  finalPrice: number;
  actualMargin: number;
  savingsVsCompetitor: number;
  savingsPercent: number;
}

export function calculatePricingWithBreakdown(
  wholesaleCostLocal: number,
  competitorDailyRate: number,
  planDuration: number,
  currency: string
): PricingBreakdown {
  const basePrice = wholesaleCostLocal * 1.60;
  const competitorTripCost = competitorDailyRate * planDuration;
  const targetPrice = competitorTripCost * COMPETITOR_DISCOUNT;
  const floorPrice = wholesaleCostLocal * MINIMUM_MARGIN_MULTIPLIER;

  let preRoundPrice: number;
  let usedTargetPrice: boolean;

  const marginAtTarget = wholesaleCostLocal > 0
    ? (targetPrice / wholesaleCostLocal - 1) * 100
    : 0;

  if (basePrice <= competitorTripCost) {
    // Base price is already at or below competitor - use base price
    preRoundPrice = basePrice;
    usedTargetPrice = false;
  } else {
    // Base price is above competitor - try to discount
    preRoundPrice = Math.max(targetPrice, floorPrice);
    usedTargetPrice = preRoundPrice === targetPrice;
  }

  const finalPrice = roundToFriendlyPrice(preRoundPrice, currency);
  const actualMargin = wholesaleCostLocal > 0
    ? (finalPrice / wholesaleCostLocal - 1) * 100
    : 0;
  const savingsVsCompetitor = competitorTripCost - finalPrice;
  const savingsPercent = competitorTripCost > 0
    ? (savingsVsCompetitor / competitorTripCost) * 100
    : 0;

  return {
    wholesaleCostLocal,
    competitorDailyRate,
    planDuration,
    competitorTripCost,
    targetPrice,
    marginAtTarget,
    usedTargetPrice,
    preRoundPrice,
    finalPrice,
    actualMargin,
    savingsVsCompetitor,
    savingsPercent,
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string): string {
  if (currency === 'IDR') {
    return Math.round(price).toLocaleString('id-ID');
  }
  return price.toFixed(2);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'AUD': '$',
    'USD': '$',
    'SGD': 'S$',
    'GBP': '£',
    'MYR': 'RM',
    'IDR': 'Rp',
  };
  return symbols[currency] || '$';
}
