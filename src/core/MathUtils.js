
export function easeOutCubic(t) {
  const f = t - 1;
  return f * f * f + 1;
}

export function easeOutBack(t, overshoot = 1.6) {
  const f = t - 1;
  return f * f * ((overshoot + 1) * f + overshoot) + 1;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function damp(current, target, lambda, dt) {
  
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
