/**
 * Utility to convert numbers to words for payroll documents
 */

// Arrays for number words
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

/**
 * Convert a number to words
 * @param num - The number to convert
 * @returns The number expressed in words
 */
export function numberToWords(num: number): string {
  // Handle edge cases
  if (num === 0) return "Zero";
  if (num < 0) return "Negative " + numberToWords(Math.abs(num));

  // Convert to string and handle decimal part
  const numStr = num.toString();
  const parts = numStr.split(".");

  let result = "";

  // Handle whole number part
  const wholeNum = parseInt(parts[0]);
  if (wholeNum > 0) {
    result = convertWholeNumber(wholeNum);
  }

  // Handle decimal part
  if (parts.length > 1) {
    const decimalPart = parts[1];
    if (parseInt(decimalPart) > 0) {
      result += " and " + decimalPart + "/100";
    }
  }

  return result;
}

/**
 * Convert a whole number to words
 * @param num - The whole number to convert
 * @returns The number expressed in words
 */
function convertWholeNumber(num: number): string {
  let words = "";
  let scaleIndex = 0;

  while (num > 0) {
    const hundreds = num % 1000;
    if (hundreds > 0) {
      const groupWords = convertGroup(hundreds);
      words =
        groupWords +
        (scales[scaleIndex] ? " " + scales[scaleIndex] : "") +
        (words ? " " + words : "");
    }

    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return words;
}

/**
 * Convert a group of up to three digits to words
 * @param num - The group to convert (0-999)
 * @returns The group expressed in words
 */
function convertGroup(num: number): string {
  let words = "";

  // Handle hundreds
  const hundred = Math.floor(num / 100);
  if (hundred > 0) {
    words += ones[hundred] + " Hundred";
  }

  // Handle tens and ones
  const tensAndOnes = num % 100;
  if (tensAndOnes > 0) {
    if (words !== "") {
      words += " ";
    }

    if (tensAndOnes < 20) {
      words += ones[tensAndOnes];
    } else {
      const tensDigit = Math.floor(tensAndOnes / 10);
      const onesDigit = tensAndOnes % 10;

      words += tens[tensDigit];

      if (onesDigit > 0) {
        words += "-" + ones[onesDigit];
      }
    }
  }

  return words;
}

export default numberToWords;
