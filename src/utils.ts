/**
 * Remove all non alphanumeric characters. Useful to remove Emoji from messages
 * @param text
 */
export const removeNonAlphanumericCharacters = (text: string) => text.replace(/[^\w]/g, '');

/**
 * Lower the text and remove all the special characters.
 * Useful to check answer without case sensitivity and accents
 * @param text
 */
export const normalizeText = (text: string): string => {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};