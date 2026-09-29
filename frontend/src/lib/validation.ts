/**
 * Executive Talks Media - Form Validation Utilities
 * Centralized, rigorous validation functions for user & admin forms.
 */

// Email regex matching standard RFC 5322 simplified pattern (requires user, @, domain name, dot, and 2+ char TLD)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone regex allowing optional +, brackets, dashes, spaces, and 10 to 15 digits
export const PHONE_REGEX = /^\+?[0-9\s\-()]{10,20}$/;

// URL regex
export const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

// GSTIN Regex (India 15 chars)
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

/**
 * Validates an email address.
 */
export function validateEmail(email: string, fieldName = "Email address"): { isValid: boolean; error: string } {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: `Please enter a valid official ${fieldName.toLowerCase()} (e.g. name@company.com).` };
  }
  // Check for common fake/garbage emails
  const domain = trimmed.split("@")[1];
  if (!domain || !domain.includes(".") || domain.endsWith(".")) {
    return { isValid: false, error: "Please enter an email with a valid domain name." };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates a mobile / phone number (strictly requires a 10-digit subscriber number).
 */
export function validatePhone(phone: string, fieldName = "Contact / Mobile number"): { isValid: boolean; error: string; cleanDigits: string } {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required.`, cleanDigits: "" };
  }

  // Extract pure digits
  const cleanDigits = trimmed.replace(/\D/g, "");

  // Determine subscriber 10-digit number (handling +91 country prefix or leading 0)
  let subscriberNumber = cleanDigits;
  if (cleanDigits.length === 12 && cleanDigits.startsWith("91")) {
    subscriberNumber = cleanDigits.slice(2);
  } else if (cleanDigits.length === 11 && cleanDigits.startsWith("0")) {
    subscriberNumber = cleanDigits.slice(1);
  }

  // Must be exactly 10 digits
  if (subscriberNumber.length < 10) {
    return {
      isValid: false,
      error: `Please enter a valid 10-digit ${fieldName.toLowerCase()} (e.g. 98765 43210).`,
      cleanDigits,
    };
  }
  if (subscriberNumber.length > 10) {
    return {
      isValid: false,
      error: `${fieldName} must be exactly 10 digits.`,
      cleanDigits,
    };
  }

  // Check for repetitive bogus sequences (e.g. 1111111111, 0000000000, 9999999999)
  const isAllSameDigit = /^(\d)\1{9}$/.test(subscriberNumber);
  if (isAllSameDigit) {
    return {
      isValid: false,
      error: `Please enter a valid real 10-digit ${fieldName.toLowerCase()}.`,
      cleanDigits,
    };
  }

  return { isValid: true, error: "", cleanDigits };
}

/**
 * Live keystroke sanitizer for phone inputs:
 * Disallows alphabets, slashes, and illegal symbols.
 * Strictly limits subscriber number to 10 digits (or max 12 digits when using +91 country code).
 */
export function sanitizePhoneInput(val: string): string {
  if (!val) return "";
  // Strip out any characters other than digits, +, -, (, ), space
  let sanitized = val.replace(/[^\d\+\-\s\(\)]/g, "");

  // Ensure only one leading +
  if (sanitized.includes("+")) {
    const hasLeadingPlus = sanitized.startsWith("+");
    sanitized = (hasLeadingPlus ? "+" : "") + sanitized.replace(/\+/g, "");
  }

  const hasPlus = sanitized.startsWith("+");
  const hasLeadingZero = sanitized.startsWith("0");

  // Max allowed digits:
  // With country code (+91): 12 digits max (2 code + 10 number)
  // With leading 0: 11 digits max (1 zero + 10 number)
  // Standard pure digits: exactly 10 digits max
  const maxAllowedDigits = hasPlus ? 12 : hasLeadingZero ? 11 : 10;

  let digitCount = 0;
  let truncated = "";
  for (const char of sanitized) {
    if (/\d/.test(char)) {
      if (digitCount < maxAllowedDigits) {
        truncated += char;
        digitCount++;
      }
    } else {
      truncated += char;
    }
  }

  return truncated;
}

/**
 * Live keystroke sanitizer for numeric fields (e.g. prices, seat counts, percentages).
 */
export function sanitizeNumericInput(val: string, allowDecimal = false, maxLength = 10): string {
  let sanitized = val;
  if (allowDecimal) {
    sanitized = sanitized.replace(/[^\d.]/g, "");
    // Keep only the first decimal point
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
    }
  } else {
    sanitized = sanitized.replace(/\D/g, "");
  }
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return sanitized;
}

/**
 * Validates personal and executive name fields.
 */
export function validateName(name: string, fieldName = "Name", minLength = 2, maxLength = 60): { isValid: boolean; error: string } {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters.` };
  }
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters.` };
  }
  // Names should contain letters and standard name characters, not purely numbers or special characters
  const containsLetter = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed);
  if (!containsLetter) {
    return { isValid: false, error: `${fieldName} must contain valid alphabet characters.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates general required text fields like Designation, Company, City, Location, etc.
 */
export function validateRequiredText(text: string, fieldName: string, minLength = 2, maxLength = 200): { isValid: boolean; error: string } {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters.` };
  }
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates URLs (e.g. LinkedIn, Portfolio, Website).
 */
export function validateUrl(url: string, fieldName = "URL", isRequired = false): { isValid: boolean; error: string } {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }

  // Prepend https:// if user entered domain directly like linkedin.com/in/user
  let formattedUrl = trimmed;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const parsed = new URL(formattedUrl);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { isValid: false, error: `Please enter a valid web link for ${fieldName.toLowerCase()}.` };
    }
    return { isValid: true, error: "" };
  } catch (e) {
    return { isValid: false, error: `Please enter a valid web link for ${fieldName.toLowerCase()}.` };
  }
}

/**
 * Validates positive number / price fields.
 */
export function validatePositiveNumber(val: any, fieldName = "Amount", min = 0, max = 100000000): { isValid: boolean; error: string; numValue: number } {
  const str = String(val ?? "").trim();
  if (!str && min > 0) {
    return { isValid: false, error: `${fieldName} is required.`, numValue: 0 };
  }
  const num = Number(str);
  if (isNaN(num)) {
    return { isValid: false, error: `Please enter a valid numeric value for ${fieldName.toLowerCase()}.`, numValue: 0 };
  }
  if (num < min) {
    return { isValid: false, error: `${fieldName} cannot be less than ${min}.`, numValue: num };
  }
  if (num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}.`, numValue: num };
  }
  return { isValid: true, error: "", numValue: num };
}
