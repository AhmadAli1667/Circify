import { SIGNAL } from './signals.js';
import { LogicComponent } from './components.js';

export class ClockSource extends LogicComponent {
  constructor(id, x, y) {
    super(id, 'CLK', x, y, 78, 44);
    this.inputCount = 0;
    this.inputStates = [];
    this.outputState = SIGNAL.LOW;
    this.inputPins = [];
    this.updatePinLayout();
  }

  updatePinLayout() {
    this.inputPins = [];
    this.outputPin = { x: this.x + this.width, y: this.y + this.height / 2 };
  }

  toggle() {
    this.outputState = this.outputState === SIGNAL.HIGH ? SIGNAL.LOW : SIGNAL.HIGH;
    return this.outputState;
  }

  evaluate() {
    return this.outputState;
  }
}

export class DFlipFlop extends LogicComponent {
  constructor(id, x, y) {
    super(id, 'DFF', x, y, 90, 72);
    this.inputCount = 2; // D=pin0, CLK=pin1
    this.inputStates = [SIGNAL.FLOAT, SIGNAL.FLOAT];
    this.outputState = SIGNAL.LOW;
    this.updatePinLayout();
  }

  updatePinLayout() {
    const step = this.height / 3;
    this.inputPins = [
      { x: this.x, y: this.y + step, index: 0 },
      { x: this.x, y: this.y + step * 2, index: 1 },
    ];
    this.outputPin = { x: this.x + this.width, y: this.y + step };
  }

  evaluate() {
    return this.outputState;
  }

  triggerClockEdge() {
    const d = this.inputStates[0];
    if (d !== SIGNAL.FLOAT) this.outputState = d;
    return this.outputState;
  }
}

export class SRLatch extends LogicComponent {
  constructor(id, x, y) {
    super(id, 'SRLATCH', x, y, 84, 64);
    this.inputCount = 2; // S=pin0, R=pin1
    this.inputStates = [SIGNAL.LOW, SIGNAL.LOW];
    this.outputState = SIGNAL.LOW;
    this.updatePinLayout();
  }

  updatePinLayout() {
    const step = this.height / 3;
    this.inputPins = [
      { x: this.x, y: this.y + step, index: 0 },
      { x: this.x, y: this.y + step * 2, index: 1 },
    ];
    this.outputPin = { x: this.x + this.width, y: this.y + step };
  }

  evaluate() {
    const S = this.inputStates[0];
    const R = this.inputStates[1];
    if (S === SIGNAL.HIGH && R === SIGNAL.LOW) return SIGNAL.HIGH;
    if (S === SIGNAL.LOW && R === SIGNAL.HIGH) return SIGNAL.LOW;
    if (S === SIGNAL.HIGH && R === SIGNAL.HIGH) return SIGNAL.FLOAT;
    return this.outputState; // S=0 R=0: hold
  }
}
