export function find_all_indicies(str: string, substr: string) {
  const occurrences: number[] = [];
  let pos = str.indexOf(substr);
  while (pos !== -1) {
    occurrences.push(pos);
    pos = str.indexOf(substr, pos + 1);
  }
  return occurrences;
}

export function mostFrequent(values: (string | undefined | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v || v === "-1" || !v.trim()) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}
