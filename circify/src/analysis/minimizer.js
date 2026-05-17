export function grayCodeList(bits) {
  if (bits <= 0) return [''];
  const out = [];
  const size = 1 << bits;
  for (let i = 0; i < size; i++) {
    out.push((i ^ (i >> 1)).toString(2).padStart(bits, '0'));
  }
  return out;
}

function combineBits(a, b) {
  let diff = 0;
  let out = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      out += a[i];
    } else {
      if (a[i] === '-' || b[i] === '-') return null;
      diff++;
      out += '-';
      if (diff > 1) return null;
    }
  }
  return diff === 1 ? out : null;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function quineMcCluskeyMinimize(numVars, minterms) {
  if (!minterms.length) return [];
  const unique = Array.from(new Set(minterms)).sort((a, b) => a - b);

  let groups = new Map();
  unique.forEach((m) => {
    const bits = m.toString(2).padStart(numVars, '0');
    const ones = bits.split('').filter((b) => b === '1').length;
    if (!groups.has(ones)) groups.set(ones, []);
    groups.get(ones).push({ bits, covered: new Set([m]), used: false });
  });

  const primes = [];
  while (groups.size > 0) {
    const next = new Map();
    const keys = Array.from(groups.keys()).sort((a, b) => a - b);

    for (let k = 0; k < keys.length - 1; k++) {
      const aGroup = groups.get(keys[k]) || [];
      const bGroup = groups.get(keys[k + 1]) || [];
      for (const a of aGroup) {
        for (const b of bGroup) {
          const comb = combineBits(a.bits, b.bits);
          if (!comb) continue;
          a.used = true;
          b.used = true;
          const ones = comb.split('').filter((x) => x === '1').length;
          if (!next.has(ones)) next.set(ones, []);
          const merged = new Set([...a.covered, ...b.covered]);
          const dup = next.get(ones).find((x) => x.bits === comb && setsEqual(x.covered, merged));
          if (!dup) next.get(ones).push({ bits: comb, covered: merged, used: false });
        }
      }
    }

    for (const arr of groups.values()) {
      for (const item of arr) {
        if (!item.used) primes.push(item);
      }
    }
    groups = next;
  }

  const chart = new Map();
  unique.forEach((m) => chart.set(m, []));
  primes.forEach((p, idx) => {
    p.covered.forEach((m) => {
      if (chart.has(m)) chart.get(m).push(idx);
    });
  });

  const selected = new Set();
  const uncovered = new Set(unique);

  for (const m of unique) {
    const covers = chart.get(m) || [];
    if (covers.length === 1) selected.add(covers[0]);
  }
  selected.forEach((idx) => primes[idx].covered.forEach((m) => uncovered.delete(m)));

  while (uncovered.size > 0) {
    let bestIdx = -1;
    let bestCount = -1;
    primes.forEach((p, idx) => {
      if (selected.has(idx)) return;
      let count = 0;
      p.covered.forEach((m) => { if (uncovered.has(m)) count++; });
      if (count > bestCount) { bestCount = count; bestIdx = idx; }
    });
    if (bestIdx < 0) break;
    selected.add(bestIdx);
    primes[bestIdx].covered.forEach((m) => uncovered.delete(m));
  }

  return Array.from(selected).map((idx) => ({ bits: primes[idx].bits, covered: primes[idx].covered }));
}

export function implicantsToSOP(implicants, varNames) {
  if (!implicants.length) return '0';
  const terms = implicants.map((imp) => {
    const bits = typeof imp === 'string' ? imp : imp.bits;
    const parts = [];
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === '-') continue;
      if (bits[i] === '1') parts.push(varNames[i]);
      if (bits[i] === '0') parts.push(`${varNames[i]}'`);
    }
    return parts.length ? parts.join(' ') : '1';
  });
  return terms.join(' + ');
}
