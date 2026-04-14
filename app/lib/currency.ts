export function formatKES(value: number | string | undefined | null): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}

export function formatClp(value: number | string | undefined | null): string {
  return formatKES(value); // placeholder for future locale-specific formatting
}
