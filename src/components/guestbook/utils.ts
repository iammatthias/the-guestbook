/**
 * Sanitizes message input by removing HTML tags, control characters, and normalizing whitespace
 */
export function sanitizeMessage(input: string): string {
  // Remove HTML tags and entities
  const noHtml = input.replace(/<[^>]*>|&[^;]+;/g, "");

  // Remove control characters and normalize whitespace
  const normalized = noHtml
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Ensure the message is within valid UTF-8 range and length
  return normalized.slice(0, 140);
}

/**
 * Returns a user-friendly error message based on the error type
 */
export function getErrorMessage(error: any): string {
  const msg = error?.message || "Unknown error occurred";

  if (msg.includes("insufficient funds")) {
    return "You don't have enough ETH for this transaction";
  }

  if (msg.includes("user rejected transaction")) {
    return "Transaction was cancelled";
  }

  if (msg.includes("user rejected request")) {
    return "Network switch was cancelled";
  }

  if (msg.includes("InsufficientFee")) {
    return "Insufficient fee provided for this operation";
  }

  if (msg.includes("EmptyMessage")) {
    return "Message cannot be empty";
  }

  if (msg.includes("MessageTooLong")) {
    return "Message exceeds 140 characters";
  }

  if (msg.includes("ContractPaused")) {
    return "The guestbook is currently paused";
  }

  return "Failed to sign guestbook. Please try again.";
}
