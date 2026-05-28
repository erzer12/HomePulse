export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function minutesBetween(a: number, b: number): number {
  return Math.floor(Math.abs(a - b) / 60000);
}
