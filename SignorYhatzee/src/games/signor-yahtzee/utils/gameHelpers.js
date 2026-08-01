export function rollRandom() {
  return Math.floor(Math.random() * 6) + 1;
}

export function getCounts(dice) {
  const counts = [0, 0, 0, 0, 0, 0];
  dice.forEach((d) => {
    if (d >= 1 && d <= 6) counts[d - 1]++;
  });
  return counts;
}

export function hasOfAKind(counts, n) {
  return counts.some((c) => c >= n);
}

export function hasStraight(counts, length) {
  let max = 0, current = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max >= length;
}

export function calculateScore(dice, category) {
  if (!dice || dice.length === 0) return 0;
  const counts = getCounts(dice);
  const sum = dice.reduce((a, b) => a + b, 0);
  switch (category) {
    case "ones": return counts[0] * 1;
    case "twos": return counts[1] * 2;
    case "threes": return counts[2] * 3;
    case "fours": return counts[3] * 4;
    case "fives": return counts[4] * 5;
    case "sixes": return counts[5] * 6;
    case "threeKind": return hasOfAKind(counts, 3) ? sum : 0;
    case "fourKind": return hasOfAKind(counts, 4) ? sum : 0;
    case "fullHouse": return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case "smallStraight": return hasStraight(counts, 4) ? 30 : 0;
    case "largeStraight": return hasStraight(counts, 5) ? 40 : 0;
    case "yahtzee": return hasOfAKind(counts, 5) ? 50 : 0;
    case "chance": return sum;
    default: return 0;
  }
}

export function cycleOption(val, opts, dir) {
  const i = opts.findIndex(o => o.v === val);
  let n = i + dir;
  if (n < 0) n = opts.length - 1;
  if (n >= opts.length) n = 0;
  return opts[n].v;
}
