/**
 * Format price in Indian Rupees
 * @param price - Price in number
 * @returns Formatted price string with ₹ symbol
 */
export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(2)}`;
};

/**
 * Format price with Indian number formatting (commas for thousands)
 * @param price - Price in number
 * @returns Formatted price string with ₹ symbol and commas
 */
export const formatPriceWithCommas = (price: number): string => {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

