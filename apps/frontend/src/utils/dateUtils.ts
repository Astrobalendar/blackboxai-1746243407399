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
import React from "react";
import { isValidDate, formatDate } from "@/utils/dateUtils";

const ExampleComponent: React.FC = () => {
  const birthDate = "1990-01-01"; // Example valid date
  const invalidDate = "not-a-date"; // Example invalid date

  return (
    <div>
      <div>
        <strong>Valid date:</strong>{" "}
        {isValidDate(birthDate) ? (
          <span>{formatDate(birthDate)}</span>
        ) : (
          <span>Invalid or missing date</span>
        )}
      </div>
      <div>
        <strong>Invalid date:</strong>{" "}
        {isValidDate(invalidDate) ? (
          <span>{formatDate(invalidDate)}</span>
        ) : (
          <span>Invalid or missing date</span>
        )}
      </div>
    </div>
  );
};

export default ExampleComponent;