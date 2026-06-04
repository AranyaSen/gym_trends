export function formatDate(date: string) {
  const formattedDate = new Date(date);
  const formatted = Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(formattedDate);
  return formatted;
}

export function formatDateTime(date: string) {
  const formattedDate = new Date(date);
  const formatted = Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(formattedDate);
  return formatted;
}
