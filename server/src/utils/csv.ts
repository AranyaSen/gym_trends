export function csvEscape(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvLine(cells: (string | number | null | undefined)[]) {
  return `${cells.map(csvEscape).join(",")}\r\n`;
}
