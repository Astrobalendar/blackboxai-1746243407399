/**
 * Checks if a given date is valid
 * @param date - The date to validate
 * @returns boolean indicating if the date is valid
 */
export function isValidDate(date: any): boolean {
  return !isNaN(new Date(date).getTime());
}

/**
 * Formats a date to a localized string
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted date string or "Invalid date" if the input is not a valid date
 */
export function formatDate(date: any, locale = "en-US"): string {
  if (!isValidDate(date)) return "Invalid date";
  return new Date(date).toLocaleString(locale);
}