export function dateInputValueInTimeZone(date = new Date(), timeZone?: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
  } catch {
    if (timeZone) return dateInputValueInTimeZone(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatNexoDate(
  value: string | Date,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no válida";
  try {
    return new Intl.DateTimeFormat("es", { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat("es", options).format(date);
  }
}
