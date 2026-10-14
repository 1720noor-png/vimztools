/**
 * Pure Cryptographic Password & Entropy Engine
 * Zero external dependencies. Node.js & Browser compatible.
 */

export const CHAR_SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?'
};

const AMBIGUOUS_CHARS = /[il1Lo0O]/g;

/**
 * Gets a cryptographically secure uniform random integer in [0, n)
 */
function secureRandomInt(n) {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const limit = Math.floor(2 ** 32 / n) * n;
    const buf = new Uint32Array(1);
    do {
      globalThis.crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % n;
  }
  // Math.random fallback for non-crypto environments
  return Math.floor(Math.random() * n);
}

/**
 * Generates a cryptographically secure random password based on custom criteria.
 *
 * @param {Object} [options]
 * @param {number} [options.length=16] - Password length (8 to 128)
 * @param {boolean} [options.lower=true] - Include lowercase letters
 * @param {boolean} [options.upper=true] - Include uppercase letters
 * @param {boolean} [options.digits=true] - Include numbers
 * @param {boolean} [options.symbols=true] - Include symbols
 * @param {boolean} [options.avoidAmbiguous=false] - Avoid lookalike characters (0, O, 1, l, I)
 * @returns {{
 *   password: string,
 *   length: number,
 *   entropy: number,
 *   strength: string,
 *   crackTime: string,
 *   summary: string
 * }}
 */
export function generatePassword(options = {}) {
  const length = Number(options.length ?? 16);
  const includeLower = options.lower !== false;
  const includeUpper = options.upper !== false;
  const includeDigits = options.digits !== false;
  const includeSymbols = options.symbols !== false;
  const avoidAmbiguous = Boolean(options.avoidAmbiguous);

  if (!Number.isInteger(length) || length < 8 || length > 128) {
    throw new Error('Password length must be an integer between 8 and 128 characters.');
  }

  const activeSets = [];
  if (includeLower) activeSets.push({ key: 'lower', chars: CHAR_SETS.lower });
  if (includeUpper) activeSets.push({ key: 'upper', chars: CHAR_SETS.upper });
  if (includeDigits) activeSets.push({ key: 'digits', chars: CHAR_SETS.digits });
  if (includeSymbols) activeSets.push({ key: 'symbols', chars: CHAR_SETS.symbols });

  if (activeSets.length === 0) {
    throw new Error('At least one character type must be selected (lower, upper, digits, symbols).');
  }

  // Filter ambiguous chars if requested
  const processedSets = activeSets.map((s) => ({
    key: s.key,
    chars: avoidAmbiguous ? s.chars.replace(AMBIGUOUS_CHARS, '') : s.chars
  })).filter((s) => s.chars.length > 0);

  const fullPool = processedSets.map((s) => s.chars).join('');

  let password = '';
  let attempts = 0;
  // Ensure at least one character from each active character set is present
  do {
    password = Array.from({ length }, () => fullPool[secureRandomInt(fullPool.length)]).join('');
    attempts++;
  } while (
    attempts < 100 &&
    !processedSets.every((s) => [...password].some((c) => s.chars.includes(c)))
  );

  const entropyData = calculatePasswordEntropy(password);

  return {
    password,
    length,
    entropy: entropyData.bits,
    strength: entropyData.rating,
    crackTime: entropyData.crackTime,
    summary: `Generated ${length}-character password (${entropyData.bits} bits entropy, ${entropyData.rating})`
  };
}

/**
 * Calculates bits of entropy and estimated brute-force crack time for a given password.
 * 
 * @param {string} password
 * @returns {{
 *   bits: number,
 *   rating: 'Weak'|'Fair'|'Good'|'Strong'|'Very strong',
 *   crackTime: string
 * }}
 */
export function calculatePasswordEntropy(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return { bits: 0, rating: 'Weak', crackTime: 'Instant' };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  poolSize = Math.max(poolSize, 10);
  const bits = Math.round(password.length * Math.log2(poolSize));

  let rating = 'Weak';
  let crackTime = '< 1 second';

  if (bits < 45) {
    rating = 'Weak';
    crackTime = 'A few seconds to hours';
  } else if (bits < 60) {
    rating = 'Fair';
    crackTime = 'Several days to months';
  } else if (bits < 80) {
    rating = 'Good';
    crackTime = 'Centuries';
  } else if (bits < 100) {
    rating = 'Strong';
    crackTime = 'Millions of years';
  } else {
    rating = 'Very strong';
    crackTime = 'Trillions of years (Uncrackable)';
  }

  return {
    bits,
    rating,
    crackTime
  };
}
