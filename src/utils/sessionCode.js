/**
 * 10-Second Dynamic Rotating Session Code Utilities
 *
 * Implements a time-synchronized rotating passcode system:
 * - Generates a 4-digit numeric dynamic token every 10 seconds.
 * - Formats complete session code: e.g. "ATT-4869-7294" or dynamic code "7294".
 * - Allows a 1-window grace period (previous 10s window) to accommodate network transit time.
 */

const WINDOW_SECONDS = 10;

/**
 * Computes a pseudo-random 4-digit integer from a seed string and time slot index.
 */
function hashSlot(seed, slot) {
  const str = `${seed || 'INFOCTESS'}:${slot}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  // Convert to absolute value and format as a 4-digit code (1000 - 9999)
  const code = Math.abs(hash % 9000) + 1000;
  return String(code);
}

/**
 * Returns the current rotating token, seconds remaining in this 10s cycle, and full dynamic code.
 * @param {string} baseSessionId E.g., 'ATT-4869'
 */
export function getRotatingSessionState(baseSessionId) {
  const now = Math.floor(Date.now() / 1000);
  const currentSlot = Math.floor(now / WINDOW_SECONDS);
  const secondsLeft = WINDOW_SECONDS - (now % WINDOW_SECONDS);
  const token = hashSlot(baseSessionId, currentSlot);
  const fullCode = baseSessionId ? `${baseSessionId}-${token}` : token;
  const qrPayload = `infoctess://session/${baseSessionId || 'ATT-0000'}?token=${token}&ts=${now}`;

  return {
    baseSessionId: baseSessionId || '',
    token,
    fullCode,
    secondsLeft,
    totalWindow: WINDOW_SECONDS,
    qrPayload
  };
}

/**
 * Validates a submitted code against the baseSessionId for either the current
 * or the immediately preceding 10-second window.
 */
export function validateRotatingCode(submittedCode, baseSessionId) {
  if (!submittedCode || !baseSessionId) return false;
  const cleanSub = String(submittedCode).trim().toUpperCase();
  const cleanBase = String(baseSessionId).trim().toUpperCase();

  // If the student directly submitted the base code (e.g. ATT-4869)
  if (cleanSub === cleanBase) return true;

  const now = Math.floor(Date.now() / 1000);
  const currentSlot = Math.floor(now / WINDOW_SECONDS);
  const prevSlot = currentSlot - 1;

  const curToken = hashSlot(baseSessionId, currentSlot);
  const prevToken = hashSlot(baseSessionId, prevSlot);

  const validOptions = [
    curToken,
    prevToken,
    `${cleanBase}-${curToken}`,
    `${cleanBase}-${prevToken}`,
    `${cleanBase} ${curToken}`,
    `${cleanBase} ${prevToken}`,
  ];

  return validOptions.includes(cleanSub);
}

/**
 * Extracts the base session id from user input.
 * Handles inputs like "ATT-4869", "ATT-4869-7294", or QR code payload url.
 */
export function extractBaseSessionId(input) {
  if (!input) return '';
  let str = String(input).trim();

  // Handle QR schema url: infoctess://session/ATT-4869?token=...
  if (str.startsWith('infoctess://session/')) {
    const afterScheme = str.replace('infoctess://session/', '');
    const base = afterScheme.split('?')[0];
    return base.toUpperCase();
  }

  // Handle ATT-4869-7294 -> ATT-4869
  const match = str.match(/(ATT-[0-9A-Z]+)(?:[- ]\d{4})?/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  return str.toUpperCase();
}
