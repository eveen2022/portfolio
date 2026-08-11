export function formatDateRange(
  startDate: string,
  endDate: string | null,
  current: boolean,
): string {
  const end = current ? "Present" : (endDate ?? "");
  return end ? `${startDate} — ${end}` : startDate;
}
