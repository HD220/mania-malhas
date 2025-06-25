import { randomUUID } from 'node:crypto';

/**
 * Generates a unique identifier using crypto.randomUUID().
 * This utility function wraps the native crypto.randomUUID() to allow for easier mocking in tests.
 * @returns {string} A V4 UUID.
 */
export const generateUniqueId = (): string => {
  return randomUUID();
};
