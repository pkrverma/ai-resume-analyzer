/**
 * Formats a size in bytes to a human-readable string
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns A formatted string with appropriate unit (B, KB, MB, GB, TB)
 */
export function formatSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const generateUUID = ()=>crypto.randomUUID();