export function isChimpLevelComplete(nextNumber: number, tileCount: number): boolean {
  return tileCount > 0 && nextNumber >= tileCount;
}
