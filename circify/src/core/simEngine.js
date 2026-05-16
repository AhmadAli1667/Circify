import { SIGNAL } from './signals.js';

export class SimEngine {
  constructor(graph) {
    this.graph = graph;
    this.isRunning = false;
    this.speed = 2; // Hz
    this.tick = 0;
    this.history = new Map(); // nodeID -> Signal[]
    this.maxHistory = 80;
    this._timerId = null;
    this._prevClkStates = new Map();
    this.onTick = null;     // callback(tick)
    this.onError = null;    // callback(msg)
  }

  step() {
    // Snapshot CLK states before toggling so we can detect rising edges
    this._prevClkStates.clear();
    for (const node of this.graph.nodes.values()) {
      if (node.type === 'CLK') this._prevClkStates.set(node.id, node.outputState);
    }

    // Toggle all clock sources
    for (const node of this.graph.nodes.values()) {
      if (node.type === 'CLK') node.toggle();
    }

    // First combinational stabilization pass
    try {
      this.graph.stabilizeAll();
    } catch (err) {
      this.onError?.(`Oscillation detected: ${err.message}`);
    }

    // Update DFFs on rising clock edges
    for (const node of this.graph.nodes.values()) {
      if (node.type !== 'DFF') continue;
      const clkEdge = this._findEdgeToPin(node.id, 1);
      if (!clkEdge) continue;
      const prevClk = this._prevClkStates.get(clkEdge.sourceID) ?? SIGNAL.LOW;
      const currClk = node.inputStates[1];
      if (prevClk === SIGNAL.LOW && currClk === SIGNAL.HIGH) {
        node.triggerClockEdge();
      }
    }

    // Second stabilization after DFF updates propagate
    try {
      this.graph.stabilizeAll();
    } catch (err) {
      this.onError?.(`Post-clock stabilization: ${err.message}`);
    }

    this.tick++;
    this._recordHistory();
    this.onTick?.(this.tick);
  }

  _findEdgeToPin(nodeID, pinIndex) {
    for (const edgeID of this.graph.incoming.get(nodeID) || []) {
      const edge = this.graph.edges.get(edgeID);
      if (edge?.targetPinIndex === pinIndex) return edge;
    }
    return null;
  }

  _recordHistory() {
    const trackedTypes = new Set(['INPUT', 'OUTPUT', 'CLK', 'DFF', 'SRLATCH']);
    for (const node of this.graph.nodes.values()) {
      if (!trackedTypes.has(node.type)) continue;
      if (!this.history.has(node.id)) this.history.set(node.id, []);
      const h = this.history.get(node.id);
      h.push(node.outputState);
      if (h.length > this.maxHistory) h.shift();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const ms = Math.max(50, 1000 / this.speed);
    this._timerId = setInterval(() => this.step(), ms);
  }

  stop() {
    if (this._timerId) { clearInterval(this._timerId); this._timerId = null; }
    this.isRunning = false;
  }

  setSpeed(hz) {
    this.speed = Math.max(0.25, Math.min(20, hz));
    if (this.isRunning) { this.stop(); this.start(); }
  }

  reset() {
    this.stop();
    this.tick = 0;
    this.history.clear();
    this._prevClkStates.clear();
    for (const node of this.graph.nodes.values()) {
      if (node.type === 'CLK') node.outputState = SIGNAL.LOW;
      if (node.type === 'DFF') node.outputState = SIGNAL.LOW;
    }
    try { this.graph.stabilizeAll(); } catch (_) {}
    this.onTick?.(0);
  }

  // Call this when the graph changes (circuit switch, node add/remove)
  syncGraph(newGraph) {
    this.stop();
    this.graph = newGraph;
    this.history.clear();
    this._prevClkStates.clear();
    this.tick = 0;
  }
}
