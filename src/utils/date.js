export function formatMonthLabel(ym) {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

export function getYYYYMM(dateStr) {
  // dateStr expected "YYYY-MM-DD"
  if (!dateStr) return "";
  return dateStr.slice(0, 7);
}

export function isInMonth(dateStr, ym) {
  if (!ym) return true;
  return getYYYYMM(dateStr) === ym;
}

export function dayOfMonth(dateStr) {
  // returns 1..31
  const d = new Date(dateStr);
  return d.getDate();
}

export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}