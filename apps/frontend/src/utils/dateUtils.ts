export function isValidDate(date: any): boolean {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function formatDate(date: any, locale = "en-US"): string {
  if (!isValidDate(date)) return "Invalid or missing date";
  return new Date(date).toLocaleString(locale);
}

// Example usage in a component
// ...existing imports...
import { isValidDate, formatDate } from "@/utils/dateUtils";

// ...inside your component render...
{isValidDate(birthDate)
  ? <span>{formatDate(birthDate)}</span>
  : <span>Invalid or missing date</span>
}