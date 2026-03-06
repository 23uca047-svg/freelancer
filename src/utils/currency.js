export function formatRupees(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "Rs 0";
  }

  return `Rs ${value.toLocaleString("en-IN")}`;
}
