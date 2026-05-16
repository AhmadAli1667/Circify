export function toVerilog(graph) {
  const order = graph.topologicalSort();
  if (!order) throw new Error('Verilog export failed: graph must remain acyclic.');

  const inputs = [];
  const outputs = [];
  const exprByNode = new Map();
  const wireDecls = [];
  const assigns = [];

  order
    .map((id) => graph.nodes.get(id))
    .filter((n) => n && n.type === 'INPUT')
    .forEach((node, idx) => {
      const name = `in${idx}`;
      inputs.push(name);
      exprByNode.set(node.id, name);
    });

  for (const nodeID of order) {
    const node = graph.nodes.get(nodeID);
    if (!node || node.type === 'INPUT') continue;

    const inEdges = Array.from(graph.incoming.get(nodeID) || [])
      .map((edgeID) => graph.edges.get(edgeID))
      .filter(Boolean)
      .sort((a, b) => a.targetPinIndex - b.targetPinIndex);

    const inExpr = Array.from({ length: node.inputCount }, (_, pinIndex) => {
      const edge = inEdges.find((e) => e.targetPinIndex === pinIndex);
      return edge ? exprByNode.get(edge.sourceID) || "1'bx" : "1'bx";
    });

    if (node.type === 'OUTPUT') {
      const outName = `out${outputs.length}`;
      outputs.push(outName);
      assigns.push(`assign ${outName} = ${inExpr[0] || "1'bx"};`);
      exprByNode.set(node.id, outName);
      continue;
    }

    const wireName = `w_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    wireDecls.push(wireName);

    let expr = "1'bx";
    if (node.type === 'AND') expr = inExpr.join(' & ');
    else if (node.type === 'OR') expr = inExpr.join(' | ');
    else if (node.type === 'NOT') expr = `~(${inExpr[0] || "1'bx"})`;
    else if (node.type === 'XOR') expr = inExpr.join(' ^ ');
    else if (node.type === 'XNOR') expr = `~(${inExpr.join(' ^ ')})`;
    else if (node.type === 'NAND') expr = `~(${inExpr.join(' & ')})`;
    else if (node.type === 'NOR') expr = `~(${inExpr.join(' | ')})`;
    else if (node.type === 'BUF') expr = inExpr[0] || "1'bx";

    assigns.push(`assign ${wireName} = ${expr};`);
    exprByNode.set(node.id, wireName);
  }

  const ports = [...inputs, ...outputs].join(', ');
  const lines = [`module circuit(${ports});`];
  if (inputs.length) lines.push(`  input wire ${inputs.join(', ')};`);
  if (outputs.length) lines.push(`  output wire ${outputs.join(', ')};`);
  if (wireDecls.length) lines.push(`  wire ${wireDecls.join(', ')};`);
  for (const a of assigns) lines.push(`  ${a}`);
  lines.push('endmodule');

  return lines.join('\n');
}
