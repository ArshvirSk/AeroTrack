/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount with ₹ symbol and Indian number formatting
 */
export function formatINR(amount) {
  if (!amount && amount !== 0) return "₹ --";

  // Convert to number if string
  const number = typeof amount === "string" ? parseFloat(amount) : amount;

  // Format with Indian number system (2 decimal places)
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(number);
}
