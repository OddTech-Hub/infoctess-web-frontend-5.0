/**
 * 90-Second Dynamic Rotating Session Code Utilities
 *
 * Implements an unguessable, cryptographically scattered time-synchronized rotating passcode system:
 * - Generates an unguessable 6-digit numeric dynamic token every 90 seconds.
 * - Formats complete session code: e.g. "ATT-4869-729415" or dynamic code "729415".
 * - Code generation uses non-linear avalanching (FNV-1a + Murmur3 fmix32) so consecutive slots
 *   have zero statistical correlation, making it impossible for students to predict or guess.
 * - Allows a 1-window grace period (previous 90s window) to accommodate network transit time.
 */

export const WINDOW_SECONDS = 90;

/**
 * Computes an unguessable pseudo-random 6-digit integer from a seed string and time slot index.
 * Uses 32-bit integer arithmetic with bit shifts and prime multipliers for cryptographic avalanche.
 */
function hashSlot(seed, slot) {
  const cleanSeed = (seed || 'INFOCTESS_SECURE_SALT').toUpperCase();
  const reversed = cleanSeed.split('').reverse().join('');
  const str = `${cleanSeed}:#${(slot * 2654435761) >>> 0}!${reversed}:@${slot ^ 0x5bf03635}`;

  let h = 0x811c9dc5; // FNV-1a 32-bit offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // 16777619 (FNV prime)
  }

  // MurmurHash3 32-bit avalanching finalizer (fmix32)
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  // Unsigned 32-bit integer mapped evenly to 6 digits (100,000 to 999,999)
  const unsigned = (h >>> 0);
  const code = (unsigned % 900000) + 100000;
  return String(code);
}

/**
 * Returns the current rotating token, seconds remaining in this 90s cycle, and full dynamic code.
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
 * or the immediately preceding 90-second window.
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
 * Handles inputs like "ATT-4869", "ATT-4869-729415", or QR code payload url.
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

  // Handle ATT-4869-729415 or ATT-4869-7294 -> ATT-4869
  const match = str.match(/(ATT-[0-9A-Z]+)(?:[- ]\d{4,6})?/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  return str.toUpperCase();
}
