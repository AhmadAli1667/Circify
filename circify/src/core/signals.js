export const SIGNAL = Object.freeze({ LOW: 0, HIGH: 1, FLOAT: null });

export const GRID_SIZE = 20;
export const PIN_SNAP_RADIUS = 15;

export const TYPE_LIST = ['AND', 'OR', 'NOT', 'XOR', 'XNOR', 'NAND', 'NOR', 'BUF'];

export const TYPE_SYMBOL = Object.freeze({
  AND: '∧', OR: '∨', NOT: '¬', XOR: '⊕',
  XNOR: '⊙', NAND: '⊼', NOR: '⊽', BUF: '▷',
});

export const ICON_PATHS = {
  AND:  'M -14 -12 L -2 -12 C 12 -12 14 -3 14 0 C 14 3 12 12 -2 12 L -14 12 Z',
  OR:   'M -16 -12 C -5 -12 3 -10 16 0 C 3 10 -5 12 -16 12 C -10 8 -8 -8 -16 -12 Z',
  NOT:  'M -14 -12 L 10 0 L -14 12 Z M 13 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  XOR:  'M -18 -12 C -10 -8 -8 8 -18 12 M -14 -12 C -3 -12 5 -10 18 0 C 5 10 -3 12 -14 12 C -8 8 -6 -8 -14 -12 Z',
  XNOR: 'M -18 -12 C -10 -8 -8 8 -18 12 M -14 -12 C -3 -12 5 -10 18 0 C 5 10 -3 12 -14 12 C -8 8 -6 -8 -14 -12 Z M 21 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  NAND: 'M -14 -12 L -2 -12 C 10 -12 12 -4 12 0 C 12 4 10 12 -2 12 L -14 12 Z M 16 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  NOR:  'M -16 -12 C -5 -12 3 -10 16 0 C 3 10 -5 12 -16 12 C -10 8 -8 -8 -16 -12 Z M 19 0 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  BUF:  'M -14 -12 L 10 0 L -14 12 Z',
};

// Mutable palette — updated by setTheme() in AppController so canvas colors match the UI theme
export const PALETTE = {
  // Signal colors
  high:       '#00d15f',
  low:        '#f04d4d',
  floating:   '#4a6a80',  // distinct from low; was incorrectly '#f04d4d' before
  selected:   '#13d1a5',
  // Canvas / node rendering
  grid:        '#1a2030',
  nodeFill0:   'rgba(22, 32, 48, 0.97)',
  nodeFill1:   'rgba(10, 16, 26, 0.97)',
  nodeStroke:  '#2e4055',
  nodeShadow:  '#0e1c2a',
  pinLabel:    '#7a9ab2',
};

let _counter = 1;
export function makeId(prefix = 'n') { return `${prefix}${_counter++}`; }
export function setCounter(n) { if (n > _counter) _counter = n; }

export function signalColor(signal) {
  if (signal === SIGNAL.HIGH)  return PALETTE.high;
  if (signal === SIGNAL.LOW)   return PALETTE.low;
  return PALETTE.floating;  // FLOAT
}

export function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function worldDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
