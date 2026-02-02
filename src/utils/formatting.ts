/**
 * Truncate a wallet address for display
 * @param address - Full wallet address string
 * @param chars - Number of characters to show on each side (default 4)
 * @returns Truncated address in format "xxxx...xxxx"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
