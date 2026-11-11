let pending: ((value: string) => void) | null = null;

export function requestPick(onPick: (value: string) => void): void {
  pending = onPick;
}

export function resolvePick(value: string): void {
  const handler = pending;
  pending = null;
  handler?.(value);
}
