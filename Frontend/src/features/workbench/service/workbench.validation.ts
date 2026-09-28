import {
  ACCEPTED_FORMATS,
  MAX_FILE_SIZE_BYTES,
  type DocumentFormat,
} from "../../../shared/types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  format?: DocumentFormat;
}

/**
 * Validate a single file for upload.
 * Checks MIME type and size.
 */
export function validateFile(file: File): ValidationResult {
  const format = ACCEPTED_FORMATS[file.type];

  if (!format) {
    return {
      valid: false,
      error: `Unsupported format: ${file.type || "unknown"}. Accepted: PDF, TXT, CSV, PNG, JPEG, WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeMB} MB). Maximum allowed: 10 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty.",
    };
  }

  return { valid: true, format };
}

/**
 * Validate the prompt string before submission.
 */
export function validatePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return { valid: false, error: "Please enter an analysis instruction." };
  }

  if (trimmed.length < 10) {
    return {
      valid: false,
      error: "Prompt is too short. Provide a clearer instruction.",
    };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: "Prompt is too long (max 2000 characters)." };
  }

  return { valid: true };
}
