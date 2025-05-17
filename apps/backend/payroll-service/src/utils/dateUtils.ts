import { format } from "date-fns";

/**
 * Format a date into a standard string format for display
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatDate = (date: Date): string => {
  return format(date, "MM/dd/yyyy");
};

/**
 * Format date to Month YYYY
 */
export const formatMonthYear = (date: Date): string => {
  if (!date) return "";

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

/**
 * Convert string to date or return null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};
