// Circuit templates — same shape as graph.toObject().
// Loaded via graph.fromObject() so self-loops (DFF feedback) are allowed.

export const TEMPLATES = [
  {
    id: 'half-adder',
    name: 'Half Adder',
    desc: 'A ⊕ B = Sum,  A ∧ B = Carry',
    nodes: [
      { id: 'ta', type: 'INPUT',  x: 80,  y: 140, label: 'A',         inputCount: 0, inputStates: [] },
      { id: 'tb', type: 'INPUT',  x: 80,  y: 240, label: 'B',         inputCount: 0, inputStates: [] },
      { id: 'tx', type: 'XOR',   x: 280, y: 155, label: 'SUM_XOR',   inputCount: 2, inputStates: [null,null] },
      { id: 'ta1',type: 'AND',   x: 280, y: 255, label: 'CARRY_AND', inputCount: 2, inputStates: [null,null] },
      { id: 'ts', type: 'OUTPUT', x: 460, y: 155, label: 'SUM',       inputCount: 1, inputStates: [null] },
      { id: 'tc', type: 'OUTPUT', x: 460, y: 255, label: 'CARRY',     inputCount: 1, inputStates: [null] },
    ],
    edges: [
      { id: 'te1', sourceID: 'ta', targetID: 'tx',  targetPinIndex: 0 },
      { id: 'te2', sourceID: 'tb', targetID: 'tx',  targetPinIndex: 1 },
      { id: 'te3', sourceID: 'ta', targetID: 'ta1', targetPinIndex: 0 },
      { id: 'te4', sourceID: 'tb', targetID: 'ta1', targetPinIndex: 1 },
      { id: 'te5', sourceID: 'tx',  targetID: 'ts', targetPinIndex: 0 },
      { id: 'te6', sourceID: 'ta1', targetID: 'tc', targetPinIndex: 0 },
    ],
  },

  {
    id: 'full-adder',
    name: 'Full Adder',
    desc: 'A + B + Cin → Sum, Cout',
    nodes: [
      { id: 'fa',  type: 'INPUT',  x: 60,  y: 120, label: 'A',     inputCount: 0, inputStates: [] },
      { id: 'fb',  type: 'INPUT',  x: 60,  y: 220, label: 'B',     inputCount: 0, inputStates: [] },
      { id: 'fc',  type: 'INPUT',  x: 60,  y: 320, label: 'Cin',   inputCount: 0, inputStates: [] },
      { id: 'fx1', type: 'XOR',   x: 240, y: 155, label: 'XOR1',  inputCount: 2, inputStates: [null,null] },
      { id: 'fx2', type: 'XOR',   x: 420, y: 185, label: 'SUM_X', inputCount: 2, inputStates: [null,null] },
      { id: 'fa1', type: 'AND',   x: 240, y: 260, label: 'AND1',  inputCount: 2, inputStates: [null,null] },
      { id: 'fa2', type: 'AND',   x: 420, y: 295, label: 'AND2',  inputCount: 2, inputStates: [null,null] },
      { id: 'fo',  type: 'OR',    x: 580, y: 275, label: 'OR_C',  inputCount: 2, inputStates: [null,null] },
      { id: 'fos', type: 'OUTPUT', x: 580, y: 185, label: 'SUM',  inputCount: 1, inputStates: [null] },
      { id: 'foc', type: 'OUTPUT', x: 730, y: 275, label: 'Cout', inputCount: 1, inputStates: [null] },
    ],
    edges: [
      { id: 'fe01', sourceID: 'fa',  targetID: 'fx1', targetPinIndex: 0 },
      { id: 'fe02', sourceID: 'fb',  targetID: 'fx1', targetPinIndex: 1 },
      { id: 'fe03', sourceID: 'fx1', targetID: 'fx2', targetPinIndex: 0 },
      { id: 'fe04', sourceID: 'fc',  targetID: 'fx2', targetPinIndex: 1 },
      { id: 'fe05', sourceID: 'fa',  targetID: 'fa1', targetPinIndex: 0 },
      { id: 'fe06', sourceID: 'fb',  targetID: 'fa1', targetPinIndex: 1 },
      { id: 'fe07', sourceID: 'fx1', targetID: 'fa2', targetPinIndex: 0 },
      { id: 'fe08', sourceID: 'fc',  targetID: 'fa2', targetPinIndex: 1 },
      { id: 'fe09', sourceID: 'fa1', targetID: 'fo',  targetPinIndex: 0 },
      { id: 'fe10', sourceID: 'fa2', targetID: 'fo',  targetPinIndex: 1 },
      { id: 'fe11', sourceID: 'fx2', targetID: 'fos', targetPinIndex: 0 },
      { id: 'fe12', sourceID: 'fo',  targetID: 'foc', targetPinIndex: 0 },
    ],
  },

  {
    id: 'sr-latch',
    name: 'SR Latch',
    desc: 'Set-Reset latch — toggle S and R inputs',
    nodes: [
      { id: 'ss', type: 'INPUT',   x: 80,  y: 140, label: 'S',    inputCount: 0, inputStates: [] },
      { id: 'sr', type: 'INPUT',   x: 80,  y: 240, label: 'R',    inputCount: 0, inputStates: [] },
      { id: 'sl', type: 'SRLATCH', x: 280, y: 165, label: 'SR_Q', inputCount: 2, inputStates: [0,0] },
      { id: 'sq', type: 'OUTPUT',  x: 460, y: 165, label: 'Q',    inputCount: 1, inputStates: [null] },
    ],
    edges: [
      { id: 'se1', sourceID: 'ss', targetID: 'sl', targetPinIndex: 0 },
      { id: 'se2', sourceID: 'sr', targetID: 'sl', targetPinIndex: 1 },
      { id: 'se3', sourceID: 'sl', targetID: 'sq', targetPinIndex: 0 },
    ],
  },

  {
    id: 'dff-demo',
    name: 'D Flip-Flop',
    desc: 'Rising-edge triggered — use Step or Play',
    nodes: [
      { id: 'dd',  type: 'INPUT',  x: 80,  y: 140, label: 'D',   inputCount: 0, inputStates: [] },
      { id: 'dc',  type: 'CLK',    x: 80,  y: 250, label: 'CLK', inputCount: 0, inputStates: [] },
      { id: 'df',  type: 'DFF',    x: 280, y: 165, label: 'FF1', inputCount: 2, inputStates: [null,null] },
      { id: 'dq',  type: 'OUTPUT', x: 480, y: 165, label: 'Q',   inputCount: 1, inputStates: [null] },
    ],
    edges: [
      { id: 'de1', sourceID: 'dd', targetID: 'df', targetPinIndex: 0 },
      { id: 'de2', sourceID: 'dc', targetID: 'df', targetPinIndex: 1 },
      { id: 'de3', sourceID: 'df', targetID: 'dq', targetPinIndex: 0 },
    ],
  },

  {
    id: 'counter',
    name: '2-bit Counter',
    desc: 'Ripple counter — Step or Play to count',
    nodes: [
      { id: 'ck',  type: 'CLK',    x: 60,  y: 200, label: 'CLK',   inputCount: 0, inputStates: [] },
      { id: 'n0',  type: 'NOT',    x: 220, y: 155, label: '~Q0',   inputCount: 1, inputStates: [null] },
      { id: 'f0',  type: 'DFF',    x: 380, y: 165, label: 'FF_Q0', inputCount: 2, inputStates: [null,null] },
      { id: 'n1',  type: 'NOT',    x: 220, y: 265, label: '~Q1',   inputCount: 1, inputStates: [null] },
      { id: 'f1',  type: 'DFF',    x: 560, y: 165, label: 'FF_Q1', inputCount: 2, inputStates: [null,null] },
      { id: 'oq0', type: 'OUTPUT', x: 720, y: 165, label: 'Q0',    inputCount: 1, inputStates: [null] },
      { id: 'oq1', type: 'OUTPUT', x: 720, y: 265, label: 'Q1',    inputCount: 1, inputStates: [null] },
    ],
    edges: [
      // FF0: clk=CLK, D=~Q0 (feedback through NOT)
      { id: 'ce1', sourceID: 'ck', targetID: 'f0', targetPinIndex: 1 },
      { id: 'ce2', sourceID: 'f0', targetID: 'n0', targetPinIndex: 0 }, // Q0 → NOT
      { id: 'ce3', sourceID: 'n0', targetID: 'f0', targetPinIndex: 0 }, // ~Q0 → D0 (creates cycle, fine for DFF)
      // FF1: clk=Q0, D=~Q1 (feedback)
      { id: 'ce4', sourceID: 'f0', targetID: 'f1', targetPinIndex: 1 }, // Q0 clocks FF1
      { id: 'ce5', sourceID: 'f1', targetID: 'n1', targetPinIndex: 0 }, // Q1 → NOT
      { id: 'ce6', sourceID: 'n1', targetID: 'f1', targetPinIndex: 0 }, // ~Q1 → D1 (creates cycle, fine)
      // Outputs
      { id: 'ce7', sourceID: 'f0', targetID: 'oq0', targetPinIndex: 0 },
      { id: 'ce8', sourceID: 'f1', targetID: 'oq1', targetPinIndex: 0 },
    ],
  },

  {
    id: 'mux',
    name: '4:1 Multiplexer',
    desc: 'S1,S0 select one of D0–D3 → Y',
    nodes: [
      { id: 'md0',  type: 'INPUT', x: 60,  y: 60,  label: 'D0', inputCount: 0, inputStates: [] },
      { id: 'md1',  type: 'INPUT', x: 60,  y: 150, label: 'D1', inputCount: 0, inputStates: [] },
      { id: 'md2',  type: 'INPUT', x: 60,  y: 240, label: 'D2', inputCount: 0, inputStates: [] },
      { id: 'md3',  type: 'INPUT', x: 60,  y: 330, label: 'D3', inputCount: 0, inputStates: [] },
      { id: 'ms0',  type: 'INPUT', x: 60,  y: 440, label: 'S0', inputCount: 0, inputStates: [] },
      { id: 'ms1',  type: 'INPUT', x: 60,  y: 530, label: 'S1', inputCount: 0, inputStates: [] },
      { id: 'mns0', type: 'NOT',  x: 200, y: 440,  label: '~S0', inputCount: 1, inputStates: [null] },
      { id: 'mns1', type: 'NOT',  x: 200, y: 530,  label: '~S1', inputCount: 1, inputStates: [null] },
      { id: 'ma0',  type: 'AND',  x: 380, y: 60,   label: 'T0', inputCount: 3, inputStates: [null,null,null] },
      { id: 'ma1',  type: 'AND',  x: 380, y: 160,  label: 'T1', inputCount: 3, inputStates: [null,null,null] },
      { id: 'ma2',  type: 'AND',  x: 380, y: 260,  label: 'T2', inputCount: 3, inputStates: [null,null,null] },
      { id: 'ma3',  type: 'AND',  x: 380, y: 360,  label: 'T3', inputCount: 3, inputStates: [null,null,null] },
      { id: 'mor',  type: 'OR',   x: 560, y: 210,  label: 'OR4', inputCount: 4, inputStates: [null,null,null,null] },
      { id: 'my',   type: 'OUTPUT',x: 720, y: 210, label: 'Y',  inputCount: 1, inputStates: [null] },
    ],
    edges: [
      // NOT gates
      { id: 'mx01', sourceID: 'ms0',  targetID: 'mns0', targetPinIndex: 0 },
      { id: 'mx02', sourceID: 'ms1',  targetID: 'mns1', targetPinIndex: 0 },
      // T0 = D0 & ~S1 & ~S0
      { id: 'mx03', sourceID: 'md0',  targetID: 'ma0', targetPinIndex: 0 },
      { id: 'mx04', sourceID: 'mns1', targetID: 'ma0', targetPinIndex: 1 },
      { id: 'mx05', sourceID: 'mns0', targetID: 'ma0', targetPinIndex: 2 },
      // T1 = D1 & ~S1 & S0
      { id: 'mx06', sourceID: 'md1',  targetID: 'ma1', targetPinIndex: 0 },
      { id: 'mx07', sourceID: 'mns1', targetID: 'ma1', targetPinIndex: 1 },
      { id: 'mx08', sourceID: 'ms0',  targetID: 'ma1', targetPinIndex: 2 },
      // T2 = D2 & S1 & ~S0
      { id: 'mx09', sourceID: 'md2',  targetID: 'ma2', targetPinIndex: 0 },
      { id: 'mx10', sourceID: 'ms1',  targetID: 'ma2', targetPinIndex: 1 },
      { id: 'mx11', sourceID: 'mns0', targetID: 'ma2', targetPinIndex: 2 },
      // T3 = D3 & S1 & S0
      { id: 'mx12', sourceID: 'md3',  targetID: 'ma3', targetPinIndex: 0 },
      { id: 'mx13', sourceID: 'ms1',  targetID: 'ma3', targetPinIndex: 1 },
      { id: 'mx14', sourceID: 'ms0',  targetID: 'ma3', targetPinIndex: 2 },
      // OR
      { id: 'mx15', sourceID: 'ma0', targetID: 'mor', targetPinIndex: 0 },
      { id: 'mx16', sourceID: 'ma1', targetID: 'mor', targetPinIndex: 1 },
      { id: 'mx17', sourceID: 'ma2', targetID: 'mor', targetPinIndex: 2 },
      { id: 'mx18', sourceID: 'ma3', targetID: 'mor', targetPinIndex: 3 },
      { id: 'mx19', sourceID: 'mor', targetID: 'my',  targetPinIndex: 0 },
    ],
  },
];

export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) ?? null;
}
