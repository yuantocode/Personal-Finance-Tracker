export const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatCurrency(value) {
  const v = Number(value);
  return currency.format(Number.isFinite(v) ? v : 0);
}