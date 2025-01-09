// Define obfuscated key parts
const obfuscatedKeyParts: string[] = ['mik_sQZI', 'Wj36cB0r', 'AWvHH51e2', '0717'];
const obfuscatedSecretParts: string[] = ['mis_3O18TN', 'SPfo1n5YR', '5ariICqwHq', 'ChPAoAgMnq3y'];

/**
 * Reconstructs a key from an array of parts.
 * @param parts - Array of string parts to join.
 * @returns The reconstructed string key.
 */
const reconstructKey = (parts: string[]): string => parts.join('');

// Export reconstructed keys
const apiKey: string = reconstructKey(obfuscatedKeyParts);
const apiSecret: string = reconstructKey(obfuscatedSecretParts);
const mapId: string = '6748437a01c8d6000bfa9935'; // Optionally obfuscate if necessary


export const mapConfig = {
    apiKey,
    apiSecret,
    mapId,
  };