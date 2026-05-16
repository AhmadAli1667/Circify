import { SIGNAL } from './signals.js';

export class LogicComponent {
  constructor(id, type, x, y, width = 82, height = 52) {
    this.id = id;
    this.type = type;
    this.label = `${type}_${id}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.inputCount = 2;
    this.inputStates = [SIGNAL.FLOAT, SIGNAL.FLOAT];
    this.outputState = SIGNAL.FLOAT;
    this.inputPins = [];
    this.outputPin = { x: this.x + this.width, y: this.y + this.height / 2 };
    this.updatePinLayout();
  }

  getAABB() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  hitTestAABB(wx, wy) {
    const { x, y, width, height } = this.getAABB();
    return wx >= x && wx <= x + width && wy >= y && wy <= y + height;
  }

  updatePinLayout() {
    this.inputPins = [];
    if (this.inputCount > 0) {
      const step = this.height / (this.inputCount + 1);
      for (let i = 0; i < this.inputCount; i++) {
        this.inputPins.push({ x: this.x, y: this.y + step * (i + 1), index: i });
      }
    }
    this.outputPin = { x: this.x + this.width, y: this.y + this.height / 2 };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updatePinLayout();
  }

  setInput(pinIndex, signal) {
    if (pinIndex < 0 || pinIndex >= this.inputStates.length) return;
    this.inputStates[pinIndex] = signal;
  }

  clearInputs() {
    this.inputStates = Array.from({ length: this.inputCount }, () => SIGNAL.FLOAT);
  }

  evaluate() {
    return this.outputState;
  }

  toggleInputCount() {
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      inputCount: this.inputCount,
      inputStates: this.inputStates,
      outputState: this.outputState,
    };
  }
}

export class LogicGate extends LogicComponent {
  constructor(id, type, x, y, inputCount = 2) {
    super(id, type, x, y, 84, 56);
    this.inputCount = inputCount;
    this.inputStates = Array.from({ length: this.inputCount }, () => SIGNAL.FLOAT);
    this.updatePinLayout();
  }

  toggleInputCount() {
    if (this.type === 'NOT') return false;
    this.inputCount = this.inputCount === 2 ? 3 : this.inputCount === 3 ? 4 : 2;
    this.inputStates = Array.from(
      { length: this.inputCount },
      (_, i) => this.inputStates[i] ?? SIGNAL.FLOAT
    );
    this.updatePinLayout();
    return true;
  }
}

export class AndGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'AND', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.LOW)) return SIGNAL.LOW;
    if (s.every((v) => v === SIGNAL.HIGH)) return SIGNAL.HIGH;
    return SIGNAL.FLOAT;
  }
}

export class OrGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'OR', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.HIGH)) return SIGNAL.HIGH;
    if (s.every((v) => v === SIGNAL.LOW)) return SIGNAL.LOW;
    return SIGNAL.FLOAT;
  }
}

export class NotGate extends LogicGate {
  constructor(id, x, y) {
    super(id, 'NOT', x, y, 1);
  }
  toggleInputCount() {
    return false;
  }
  evaluate() {
    const s = this.inputStates[0];
    if (s === SIGNAL.FLOAT) return SIGNAL.FLOAT;
    return s === SIGNAL.HIGH ? SIGNAL.LOW : SIGNAL.HIGH;
  }
}

export class XorGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'XOR', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.FLOAT)) return SIGNAL.FLOAT;
    const ones = s.reduce((acc, v) => acc + (v === SIGNAL.HIGH ? 1 : 0), 0);
    return ones % 2 === 1 ? SIGNAL.HIGH : SIGNAL.LOW;
  }
}

export class XnorGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'XNOR', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.FLOAT)) return SIGNAL.FLOAT;
    const ones = s.reduce((acc, v) => acc + (v === SIGNAL.HIGH ? 1 : 0), 0);
    return ones % 2 === 0 ? SIGNAL.HIGH : SIGNAL.LOW;
  }
}

export class NandGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'NAND', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.LOW)) return SIGNAL.HIGH;
    if (s.every((v) => v === SIGNAL.HIGH)) return SIGNAL.LOW;
    return SIGNAL.FLOAT;
  }
}

export class NorGate extends LogicGate {
  constructor(id, x, y, inputCount = 2) {
    super(id, 'NOR', x, y, inputCount);
  }
  evaluate() {
    const s = this.inputStates;
    if (s.some((v) => v === SIGNAL.HIGH)) return SIGNAL.LOW;
    if (s.every((v) => v === SIGNAL.LOW)) return SIGNAL.HIGH;
    return SIGNAL.FLOAT;
  }
}

export class BufferGate extends LogicGate {
  constructor(id, x, y) {
    super(id, 'BUF', x, y, 1);
  }
  toggleInputCount() {
    return false;
  }
  evaluate() {
    return this.inputStates[0] ?? SIGNAL.FLOAT;
  }
}

export class InputSource extends LogicComponent {
  constructor(id, x, y) {
    super(id, 'INPUT', x, y, 78, 44);
    this.inputCount = 0;
    this.inputStates = [];
    this.outputState = SIGNAL.LOW;
    this.inputPins = [];
    this.updatePinLayout();
  }

  cycleState() {
    if (this.outputState === SIGNAL.LOW) this.outputState = SIGNAL.HIGH;
    else if (this.outputState === SIGNAL.HIGH) this.outputState = SIGNAL.FLOAT;
    else this.outputState = SIGNAL.LOW;
  }

  evaluate() {
    return this.outputState;
  }
}

export class OutputProbe extends LogicComponent {
  constructor(id, x, y) {
    super(id, 'OUTPUT', x, y, 78, 44);
    this.inputCount = 1;
    this.inputStates = [SIGNAL.FLOAT];
    this.outputState = SIGNAL.FLOAT;
    this.outputPin = null;
    this.updatePinLayout();
  }

  updatePinLayout() {
    this.inputPins = [{ x: this.x, y: this.y + this.height / 2, index: 0 }];
    this.outputPin = null;
  }

  evaluate() {
    this.outputState = this.inputStates[0] ?? SIGNAL.FLOAT;
    return this.outputState;
  }

  toJSON() {
    return { ...super.toJSON(), outputPin: null };
  }
}

export class Connection {
  constructor(id, sourceID, targetID, targetPinIndex) {
    this.id = id;
    this.sourceID = sourceID;
    this.targetID = targetID;
    this.targetPinIndex = targetPinIndex;
    this.signal = SIGNAL.FLOAT;
    this.pulseOffset = Math.random();
  }

  toJSON() {
    return {
      id: this.id,
      sourceID: this.sourceID,
      targetID: this.targetID,
      targetPinIndex: this.targetPinIndex,
    };
  }
}
