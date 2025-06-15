
/**
 * Generate a random SKU code.
 * Example: GEN-1234ABC, VAL-5678XYZ
 * 
 * @param category - product category name (optional)
 */
export function generateSKU(category?: string) {
  const categoryPart = (category ? category.slice(0, 3) : 'SKU').toUpperCase(); // e.g. 'GEN'
  const numPart = Math.floor(1000 + Math.random() * 9000); // 4 digit
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alphaPart = '';
  for (let i = 0; i < 3; i++) {
    alphaPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return `${categoryPart}-${numPart}${alphaPart}`; // e.g. GEN-4321ABC
}
