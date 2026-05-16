import { worldDistance } from '../core/signals.js';

export function cubicBezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

export function connectionCurveFromPins(p0, p3) {
  const dx = Math.max(44, Math.abs(p3.x - p0.x) * 0.5);
  return {
    p0,
    p1: { x: p0.x + dx, y: p0.y },
    p2: { x: p3.x - dx, y: p3.y },
    p3,
  };
}

export function nearestPointOnBezierApprox(point, p0, p1, p2, p3) {
  let bestDistance = Infinity;
  let bestPoint = { ...p0 };
  let bestT = 0;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sample = cubicBezierPoint(p0, p1, p2, p3, t);
    const d = worldDistance(point, sample);
    if (d < bestDistance) {
      bestDistance = d;
      bestPoint = sample;
      bestT = t;
    }
  }
  return { point: bestPoint, distance: bestDistance, t: bestT };
}

export function distanceToBezierApprox(point, p0, p1, p2, p3) {
  let best = Infinity;
  for (let i = 0; i <= 28; i++) {
    const d = worldDistance(point, cubicBezierPoint(p0, p1, p2, p3, i / 28));
    if (d < best) best = d;
  }
  return best;
}
