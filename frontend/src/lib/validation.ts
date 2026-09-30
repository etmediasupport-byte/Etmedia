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

// List of common fake, test, or keyboard mash tokens
const SPAM_TOKENS = new Set([
  "test",
  "testing",
  "tester",
  "asdf",
  "asdfgh",
  "asdfghjk",
  "qwerty",
  "qwertyuiop",
  "zxcv",
  "zxcvbnm",
  "none",
  "na",
  "n/a",
  "null",
  "undefined",
  "dummy",
  "xyz",
  "abc",
  "sample",
  "random",
  "fake",
  "temp",
  "aaaa",
  "bbbb",
  "cccc",
  "dddd",
  "xxxx",
  "yyyy",
  "zzzz",
  "1234",
  "12345",
  "123456",
]);

/**
 * Checks if a string looks like gibberish, spam, or keyboard mash.
 */
export function isGibberishOrSpam(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();

  // Exact spam word match
  if (SPAM_TOKENS.has(clean)) return true;

  // Repetitive 3+ same characters (e.g. "Dedddddd", "aaaaaa", "11111")
  if (/(.)\1{2,}/i.test(clean)) return true;

  // Repetitive 2-3 char sequences (e.g. "dedede", "hahaha", "ababab", "asdfasdf")
  if (/(.{2,3})\1{2,}/i.test(clean)) return true;

  // Words of 5+ letters with no vowels (e.g. "bcdfgh", "zxcvbn")
  const words = clean.split(/[\s,.-]+/);
  for (const w of words) {
    if (w.length >= 5 && !/[aeiouy]/.test(w)) {
      return true;
    }
  }

  return false;
}

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
  const domainParts = domain.split(".");
  if (domainParts.some((part) => isGibberishOrSpam(part))) {
    return { isValid: false, error: "Please enter a valid real work email address." };
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
  let sanitized = val.replace(/[^\d\+\-\s\(\)]/g, "");

  if (sanitized.includes("+")) {
    const hasLeadingPlus = sanitized.startsWith("+");
    sanitized = (hasLeadingPlus ? "+" : "") + sanitized.replace(/\+/g, "");
  }

  const hasPlus = sanitized.startsWith("+");
  const hasLeadingZero = sanitized.startsWith("0");

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
export function validateName(name: string, fieldName = "Full Name", minLength = 2, maxLength = 60): { isValid: boolean; error: string } {
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
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, dots, and hyphens.` };
  }
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please enter a valid real ${fieldName.toLowerCase()} (e.g. Rajesh Kumar).` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates professional job designations / titles (e.g. "Director", "CHRO", "Vice President - Marketing").
 */
export function validateDesignation(designation: string, fieldName = "Designation", isRequired = true): { isValid: boolean; error: string } {
  const trimmed = (designation || "").trim();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters (e.g. VP, HR).` };
  }
  if (trimmed.length > 80) {
    return { isValid: false, error: `${fieldName} cannot exceed 80 characters.` };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} must contain valid letters.` };
  }
  if (!/^[a-zA-Z0-9\s.,/&()-]+$/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} contains invalid special characters.` };
  }
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please enter a valid professional ${fieldName.toLowerCase()} (e.g. Vice President, Director of Marketing, CHRO).` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates company or organization name.
 */
export function validateCompanyName(company: string, fieldName = "Company / Organization Name", isRequired = true): { isValid: boolean; error: string } {
  const trimmed = (company || "").trim();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters.` };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} cannot exceed 100 characters.` };
  }
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} must contain valid letters or numbers.` };
  }
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()} (e.g. Acme Tech Solutions Pvt Ltd).` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates location / city / headquarters / address fields.
 */
export function validateLocation(location: string, fieldName = "Location", isRequired = true): { isValid: boolean; error: string } {
  const trimmed = (location || "").trim();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: `${fieldName} must be at least 3 characters (e.g. Goa, Pune, Hyderabad).` };
  }
  if (trimmed.length > 120) {
    return { isValid: false, error: `${fieldName} cannot exceed 120 characters.` };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: `${fieldName} must contain valid city / region names.` };
  }
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()} (e.g. Hyderabad, India or Bengaluru, Karnataka).` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates textarea message / proposal / requirements.
 */
export function validateMessage(message: string, fieldName = "Message", isRequired = false, minLength = 10): { isValid: boolean; error: string } {
  const trimmed = (message || "").trim();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters.` };
  }
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please provide meaningful text for ${fieldName.toLowerCase()}.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Validates general required text fields.
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
  if (isGibberishOrSpam(trimmed)) {
    return { isValid: false, error: `Please enter valid text for ${fieldName.toLowerCase()}.` };
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
      return { isValid: false, error: `Please enter a valid web link for ${fieldName.toLowerCase()} (e.g. https://company.com).` };
    }
    return { isValid: true, error: "" };
  } catch (e) {
    return { isValid: false, error: `Please enter a valid web link for ${fieldName.toLowerCase()} (e.g. https://company.com).` };
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

/**
 * Validates India GSTIN number (optional or required).
 */
export function validateGstNumber(gst: string, fieldName = "GST Number", isRequired = false): { isValid: boolean; error: string } {
  const trimmed = (gst || "").trim().toUpperCase();
  if (!trimmed) {
    if (isRequired) return { isValid: false, error: `${fieldName} is required.` };
    return { isValid: true, error: "" };
  }
  if (!GST_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid 15-character GSTIN (e.g. 36AAAAA0000A1Z5)." };
  }
  return { isValid: true, error: "" };
}
