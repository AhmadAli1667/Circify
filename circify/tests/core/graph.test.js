import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitGraph } from '../../src/core/graph.js';
import { AndGate, OrGate, NotGate, InputSource, OutputProbe } from '../../src/core/components.js';
import { SIGNAL } from '../../src/core/signals.js';

function makeGraph() {
  return new CircuitGraph();
}

describe('CircuitGraph – node management', () => {
  it('adds and retrieves a node', () => {
    const g = makeGraph();
    const gate = new AndGate('g1', 0, 0);
    g.addNode(gate);
    expect(g.getNode('g1')).toBe(gate);
  });

  it('removes a node and its edges', () => {
    const g = makeGraph();
    const inp = new InputSource('i1', 0, 0);
    const out = new OutputProbe('o1', 100, 0);
    g.addNode(inp);
    g.addNode(out);
    g.addConnection(inp.id, out.id, 0);
    expect(g.edges.size).toBe(1);
    g.removeNode(inp.id);
    expect(g.edges.size).toBe(0);
    expect(g.getNode('i1')).toBeUndefined();
  });
});

describe('CircuitGraph – connections', () => {
  let g, inp, out;
  beforeEach(() => {
    g = makeGraph();
    inp = new InputSource('i1', 0, 0);
    out = new OutputProbe('o1', 100, 0);
    g.addNode(inp);
    g.addNode(out);
  });

  it('creates a valid connection', () => {
    const result = g.addConnection('i1', 'o1', 0);
    expect(result.ok).toBe(true);
    expect(g.edges.size).toBe(1);
  });

  it('rejects self-loops', () => {
    const result = g.addConnection('i1', 'i1', 0);
    expect(result.ok).toBe(false);
  });

  it('rejects driving an InputSource', () => {
    const buf = new InputSource('i2', 50, 0);
    g.addNode(buf);
    const result = g.addConnection('i1', 'i2', 0);
    expect(result.ok).toBe(false);
  });

  it('replaces duplicate pin connection', () => {
    const inp2 = new InputSource('i2', 0, 50);
    g.addNode(inp2);
    g.addConnection('i1', 'o1', 0);
    g.addConnection('i2', 'o1', 0);
    expect(g.edges.size).toBe(1);
    const edge = Array.from(g.edges.values())[0];
    expect(edge.sourceID).toBe('i2');
  });
});

describe('CircuitGraph – simulation', () => {
  it('propagates AND gate correctly', () => {
    const g = makeGraph();
    const a = new InputSource('a', 0, 0);
    const b = new InputSource('b', 0, 60);
    const gate = new AndGate('and1', 120, 30);
    const out = new OutputProbe('out1', 240, 30);
    [a, b, gate, out].forEach((n) => g.addNode(n));
    g.addConnection('a', 'and1', 0);
    g.addConnection('b', 'and1', 1);
    g.addConnection('and1', 'out1', 0);

    a.outputState = SIGNAL.HIGH;
    b.outputState = SIGNAL.HIGH;
    g.stabilizeAll();
    expect(out.outputState).toBe(SIGNAL.HIGH);

    b.outputState = SIGNAL.LOW;
    g.stabilizeAll();
    expect(out.outputState).toBe(SIGNAL.LOW);
  });

  it('propagates NOT gate correctly', () => {
    const g = makeGraph();
    const inp = new InputSource('i', 0, 0);
    const not = new NotGate('not1', 100, 0);
    const out = new OutputProbe('o', 200, 0);
    [inp, not, out].forEach((n) => g.addNode(n));
    g.addConnection('i', 'not1', 0);
    g.addConnection('not1', 'o', 0);

    inp.outputState = SIGNAL.HIGH;
    g.stabilizeAll();
    expect(out.outputState).toBe(SIGNAL.LOW);

    inp.outputState = SIGNAL.LOW;
    g.stabilizeAll();
    expect(out.outputState).toBe(SIGNAL.HIGH);
  });

  it('handles floating inputs gracefully', () => {
    const g = makeGraph();
    const inp = new InputSource('i', 0, 0);
    const gate = new AndGate('g', 100, 0);
    const out = new OutputProbe('o', 200, 0);
    inp.outputState = SIGNAL.FLOAT;
    [inp, gate, out].forEach((n) => g.addNode(n));
    g.addConnection('i', 'g', 0);
    g.addConnection('g', 'o', 0);
    g.stabilizeAll();
    expect(out.outputState).toBe(SIGNAL.FLOAT);
  });
});

describe('CircuitGraph – topological sort', () => {
  it('has no cycle on an empty graph', () => {
    const g = makeGraph();
    expect(g.topologicalSort()).not.toBeNull();
  });

  it('has no cycle on a fresh two-node graph', () => {
    const g = makeGraph();
    g.addNode(new OrGate('a', 0, 0));
    g.addNode(new OrGate('b', 100, 0));
    expect(g.topologicalSort()).not.toBeNull();
  });

  it('returns correct order for linear chain', () => {
    const g = makeGraph();
    const inp = new InputSource('i', 0, 0);
    const not = new NotGate('n', 100, 0);
    const out = new OutputProbe('o', 200, 0);
    [inp, not, out].forEach((node) => g.addNode(node));
    g.addConnection('i', 'n', 0);
    g.addConnection('n', 'o', 0);
    const order = g.topologicalSort();
    expect(order).not.toBeNull();
    expect(order.indexOf('i')).toBeLessThan(order.indexOf('n'));
    expect(order.indexOf('n')).toBeLessThan(order.indexOf('o'));
  });
});

describe('CircuitGraph – serialization', () => {
  it('round-trips through toJSON / fromJSON', () => {
    const g = makeGraph();
    const inp = new InputSource('i1', 10, 20);
    inp.label = 'myInput';
    inp.outputState = SIGNAL.HIGH;
    const out = new OutputProbe('o1', 200, 20);
    [inp, out].forEach((n) => g.addNode(n));
    g.addConnection('i1', 'o1', 0);

    const json = g.toJSON();
    const g2 = makeGraph();
    g2.fromJSON(json);

    expect(g2.nodes.size).toBe(2);
    expect(g2.edges.size).toBe(1);
    const restored = g2.getNode('i1');
    expect(restored.label).toBe('myInput');
  });
});
