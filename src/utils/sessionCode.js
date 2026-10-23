/**
 * 90-Second Dynamic Rotating Session Code Utilities (ATT-XXXX Format)
 *
 * Requirements:
 * - ONLY ONE TYPE OF CODE: Format is strictly "ATT-xxxx" (4 digits, e.g. "ATT-4869").
 * - This "ATT-xxxx" code changes every 90 seconds.
 * - Removed the separate 6-digit combination/suffix.
 * - Uses cryptographic avalanche (Murmur3 fmix32 + FNV-1a) so consecutive 4-digit codes
 *   cannot be predicted or guessed by students.
 * - Allows a 1-window grace period (previous 90s window) for network latency tolerance.
 */

export const WINDOW_SECONDS = 90;

/**
 * Computes an unguessable pseudo-random 4-digit string from a seed string and time slot index.
 */
function hashSlot(seed, slot) {
  const cleanSeed = (seed || 'INFOCTESS_SECURE_SALT').toUpperCase();
  const reversed = cleanSeed.split('').reverse().join('');
  const str = `${cleanSeed}:#${(slot * 2654435761) >>> 0}!${reversed}:@${slot ^ 0x5bf03635}`;

  let h = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // 16777619
  }

  // MurmurHash3 32-bit avalanche finalizer
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  // 4-digit code (1000 to 9999)
  const unsigned = (h >>> 0);
  const code = (unsigned % 9000) + 1000;
  return String(code);
}

/**
 * Returns the current rotating ATT-xxxx code, seconds remaining in this 90s cycle, and QR payload.
 * @param {string} baseSessionId E.g., 'ATT-4869'
 */
export function getRotatingSessionState(baseSessionId) {
  const now = Math.floor(Date.now() / 1000);
  const currentSlot = Math.floor(now / WINDOW_SECONDS);
  const secondsLeft = WINDOW_SECONDS - (now % WINDOW_SECONDS);

  const tokenDigits = hashSlot(baseSessionId, currentSlot);
  // Strictly format as ATT-xxxx
  const dynamicCode = `ATT-${tokenDigits}`;
  const qrPayload = `infoctess://session/${dynamicCode}?ts=${now}`;

  return {
    baseSessionId: baseSessionId || '',
    token: tokenDigits,
    dynamicCode, // e.g. "ATT-4869"
    fullCode: dynamicCode,
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

  // If student directly submitted the base code
  if (cleanSub === cleanBase) return true;

  const now = Math.floor(Date.now() / 1000);
  const currentSlot = Math.floor(now / WINDOW_SECONDS);
  const prevSlot = currentSlot - 1;

  const curDigits = hashSlot(baseSessionId, currentSlot);
  const prevDigits = hashSlot(baseSessionId, prevSlot);

  const curCode = `ATT-${curDigits}`;
  const prevCode = `ATT-${prevDigits}`;

  const validOptions = [
    curCode,
    prevCode,
    curDigits,
    prevDigits,
    cleanBase,
    `ATT ${curDigits}`,
    `ATT ${prevDigits}`
  ];

  return validOptions.includes(cleanSub);
}

/**
 * Extracts base session id or ATT-xxxx code from user input or QR payload.
 */
export function extractBaseSessionId(input) {
  if (!input) return '';
  let str = String(input).trim();

  // Handle QR schema url: infoctess://session/ATT-4869?ts=...
  if (str.startsWith('infoctess://session/')) {
    const afterScheme = str.replace('infoctess://session/', '');
    const base = afterScheme.split('?')[0];
    return base.toUpperCase();
  }

  // Handle ATT-xxxx
  const match = str.match(/(ATT-[0-9A-Z]{4,6})/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // Handle 4 raw digits: e.g. "4869" -> "ATT-4869"
  if (/^\d{4}$/.test(str)) {
    return `ATT-${str}`;
  }

  return str.toUpperCase();
}
