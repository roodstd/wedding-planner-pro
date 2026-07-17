export function fmt(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function recalcRundown<T extends { dur: number; start: number; end: number }>(
  items: T[],
  startTime: string
): T[] {
  if (!startTime) return items;
  let cur = parseTime(startTime);
  return items.map((item) => {
    const start = cur;
    const end = cur + item.dur;
    cur = end;
    return { ...item, start, end };
  });
}
