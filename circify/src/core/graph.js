import { SIGNAL, makeId, setCounter } from './signals.js';
import {
  AndGate,
  OrGate,
  NotGate,
  XorGate,
  XnorGate,
  NandGate,
  NorGate,
  BufferGate,
  InputSource,
  OutputProbe,
  Connection,
} from './components.js';
import { ClockSource, DFlipFlop, SRLatch } from './sequential.js';

export class CircuitGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacency = new Map();
    this.incoming = new Map();
    this.maxPropagationDepth = 2048;
  }

  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
    this.incoming.clear();
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) this.adjacency.set(node.id, new Set());
    if (!this.incoming.has(node.id)) this.incoming.set(node.id, new Set());
    return node;
  }

  removeNode(nodeID) {
    const incoming = this.incoming.get(nodeID) || new Set();
    const outgoing = this.adjacency.get(nodeID) || new Set();
    [...incoming, ...outgoing].forEach((edgeID) => this.removeConnection(edgeID));
    this.nodes.delete(nodeID);
    this.adjacency.delete(nodeID);
    this.incoming.delete(nodeID);
  }

  removeConnection(edgeID) {
    const edge = this.edges.get(edgeID);
    if (!edge) return;
    this.edges.delete(edgeID);
    this.adjacency.get(edge.sourceID)?.delete(edgeID);
    this.incoming.get(edge.targetID)?.delete(edgeID);
  }

  getNode(nodeID) {
    return this.nodes.get(nodeID);
  }

  findConnectionToPin(targetID, pinIndex) {
    for (const edgeID of this.incoming.get(targetID) || new Set()) {
      const edge = this.edges.get(edgeID);
      if (edge && edge.targetPinIndex === pinIndex) return edge;
    }
    return null;
  }

  hasPath(startID, targetID, visited = new Set()) {
    if (startID === targetID) return true;
    if (visited.has(startID)) return false;
    visited.add(startID);
    for (const edgeID of this.adjacency.get(startID) || []) {
      const edge = this.edges.get(edgeID);
      if (!edge) continue;
      if (this.hasPath(edge.targetID, targetID, visited)) return true;
    }
    return false;
  }

  detectCycle() {
    const visitState = new Map();
    const dfs = (nodeID) => {
      visitState.set(nodeID, 1);
      for (const edgeID of this.adjacency.get(nodeID) || []) {
        const edge = this.edges.get(edgeID);
        if (!edge) continue;
        const next = edge.targetID;
        const state = visitState.get(next) || 0;
        if (state === 1) return true;
        if (state === 0 && dfs(next)) return true;
      }
      visitState.set(nodeID, 2);
      return false;
    };
    for (const nodeID of this.nodes.keys()) {
      if ((visitState.get(nodeID) || 0) === 0 && dfs(nodeID)) return true;
    }
    return false;
  }

  addConnection(sourceID, targetID, targetPinIndex) {
    if (sourceID === targetID) return { ok: false, reason: 'Self-loop is not allowed.' };

    const source = this.nodes.get(sourceID);
    const target = this.nodes.get(targetID);
    if (!source || !target) return { ok: false, reason: 'Invalid source or target.' };
    if (target.type === 'INPUT') return { ok: false, reason: 'Cannot drive an InputSource.' };
    if (!target.inputPins[targetPinIndex]) return { ok: false, reason: 'Invalid target pin.' };

    const prior = this.findConnectionToPin(targetID, targetPinIndex);
    if (prior) this.removeConnection(prior.id);

    const edge = new Connection(makeId('e'), sourceID, targetID, targetPinIndex);
    this.edges.set(edge.id, edge);
    this.adjacency.get(sourceID)?.add(edge.id);
    this.incoming.get(targetID)?.add(edge.id);
    this.refreshTargetInputs(targetID);

    return { ok: true, edge };
  }

  refreshTargetInputs(targetID) {
    const target = this.nodes.get(targetID);
    if (!target || target.inputCount === 0) return;
    target.clearInputs();
    for (const edgeID of this.incoming.get(targetID) || []) {
      const edge = this.edges.get(edgeID);
      if (!edge) continue;
      const source = this.nodes.get(edge.sourceID);
      edge.signal = source?.outputState ?? SIGNAL.FLOAT;
      target.setInput(edge.targetPinIndex, edge.signal);
    }
  }

  cleanupInvalidPinConnections(nodeID) {
    const node = this.nodes.get(nodeID);
    if (!node) return;
    for (const edgeID of this.incoming.get(nodeID) || []) {
      const edge = this.edges.get(edgeID);
      if (edge && edge.targetPinIndex >= node.inputCount) {
        this.removeConnection(edgeID);
      }
    }
    this.refreshTargetInputs(nodeID);
  }

  propagateFrom(sourceID) {
    const origin = this.nodes.get(sourceID);
    if (!origin) return;
    if (origin.type === 'INPUT') origin.evaluate();
    this.stabilizeAll();
  }

  stabilizeAll() {
    const maxIterations = Math.max(24, Math.min(this.maxPropagationDepth, this.nodes.size * 40 + 40));

    for (const node of this.nodes.values()) {
      if (node.type === 'INPUT') node.outputState = node.evaluate();
    }

    let converged = false;
    for (let step = 0; step < maxIterations; step++) {
      for (const node of this.nodes.values()) {
        if (node.type !== 'INPUT' && node.inputCount > 0) node.clearInputs();
      }
      for (const edge of this.edges.values()) {
        const source = this.nodes.get(edge.sourceID);
        edge.signal = source?.outputState ?? SIGNAL.FLOAT;
        const target = this.nodes.get(edge.targetID);
        if (!target) continue;
        if (edge.targetPinIndex < target.inputCount) {
          target.setInput(edge.targetPinIndex, edge.signal);
        }
      }
      let changed = false;
      for (const node of this.nodes.values()) {
        if (node.type === 'INPUT') continue;
        const next = node.evaluate();
        if (next !== node.outputState) {
          node.outputState = next;
          changed = true;
        }
      }
      if (!changed) {
        converged = true;
        break;
      }
    }

    for (const edge of this.edges.values()) {
      const source = this.nodes.get(edge.sourceID);
      edge.signal = source?.outputState ?? SIGNAL.FLOAT;
    }

    if (!converged) throw new Error('Simulation did not stabilize (possible oscillation).');
  }

  topologicalSort() {
    const indegree = new Map();
    for (const nodeID of this.nodes.keys()) indegree.set(nodeID, 0);
    for (const edge of this.edges.values()) {
      indegree.set(edge.targetID, (indegree.get(edge.targetID) || 0) + 1);
    }

    const queue = [];
    for (const [nodeID, deg] of indegree.entries()) {
      if (deg === 0) queue.push(nodeID);
    }

    const order = [];
    while (queue.length > 0) {
      const nodeID = queue.shift();
      order.push(nodeID);
      for (const edgeID of this.adjacency.get(nodeID) || []) {
        const edge = this.edges.get(edgeID);
        if (!edge) continue;
        const next = edge.targetID;
        indegree.set(next, (indegree.get(next) || 0) - 1);
        if (indegree.get(next) === 0) queue.push(next);
      }
    }

    return order.length === this.nodes.size ? order : null;
  }

  toObject(viewport = null) {
    return {
      nodes: Array.from(this.nodes.values()).map((n) => n.toJSON()),
      edges: Array.from(this.edges.values()).map((e) => e.toJSON()),
      viewport,
    };
  }

  toJSON(viewport = null) {
    return JSON.stringify(this.toObject(viewport), null, 2);
  }

  fromObject(data) {
    this.clear();

    const buildNode = (record) => {
      const { id, type, x, y, inputCount } = record;
      let node = null;
      const ic = inputCount || 2;
      switch (type) {
        case 'AND': node = new AndGate(id, x, y, ic); break;
        case 'OR': node = new OrGate(id, x, y, ic); break;
        case 'NOT': node = new NotGate(id, x, y); break;
        case 'XOR': node = new XorGate(id, x, y, ic); break;
        case 'XNOR': node = new XnorGate(id, x, y, ic); break;
        case 'NAND': node = new NandGate(id, x, y, ic); break;
        case 'NOR': node = new NorGate(id, x, y, ic); break;
        case 'BUF': node = new BufferGate(id, x, y); break;
        case 'INPUT': node = new InputSource(id, x, y); break;
        case 'OUTPUT': node = new OutputProbe(id, x, y); break;
        case 'CLK': node = new ClockSource(id, x, y); break;
        case 'DFF': node = new DFlipFlop(id, x, y); break;
        case 'SRLATCH': node = new SRLatch(id, x, y); break;
        default: throw new Error(`Unsupported node type: ${type}`);
      }
      node.width = record.width ?? node.width;
      node.height = record.height ?? node.height;
      node.label = record.label ?? `${node.type}_${node.id}`;
      node.inputCount = record.inputCount ?? node.inputCount;
      node.inputStates = Array.from(
        { length: node.inputCount },
        (_, i) => record.inputStates?.[i] ?? SIGNAL.FLOAT
      );
      node.outputState = record.outputState ?? SIGNAL.FLOAT;
      node.updatePinLayout();
      return node;
    };

    for (const nodeData of data.nodes || []) {
      const node = buildNode(nodeData);
      this.addNode(node);
      const num = Number(String(node.id).replace(/[^0-9]/g, ''));
      if (!Number.isNaN(num)) setCounter(num + 1);
    }

    for (const edgeData of data.edges || []) {
      const edge = new Connection(edgeData.id, edgeData.sourceID, edgeData.targetID, edgeData.targetPinIndex);
      this.edges.set(edge.id, edge);
      this.adjacency.get(edge.sourceID)?.add(edge.id);
      this.incoming.get(edge.targetID)?.add(edge.id);
      const num = Number(String(edge.id).replace(/[^0-9]/g, ''));
      if (!Number.isNaN(num)) setCounter(num + 1);
    }

    this.stabilizeAll();
  }

  fromJSON(raw) {
    const obj = JSON.parse(raw);
    this.fromObject(obj);
    return obj;
  }
}
