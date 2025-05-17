// Utility to generate a 6-character referenceId: first 2 uppercase letters of fullName (no spaces) + 4-digit hash
export function generateReferenceId(fullName: string): string {
  const name = (fullName || '').replace(/\s+/g, '').toUpperCase();
  const prefix = name.slice(0, 2);
  // Simple hash function for demonstration
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 10000);
  const suffix = num.toString().padStart(4, '0');
  return prefix + suffix;
}
