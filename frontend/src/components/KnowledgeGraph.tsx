"use client";

import { useEffect, useState } from "react";

interface Node {
  id: string;
  label: string;
  group: string;
  accessibility: number;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  relation: string;
  distance: number;
  color: string;
}

interface KnowledgeGraphProps {
  activeEnv: string;
  profile: string;
}

export default function KnowledgeGraph({ activeEnv, profile }: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/graph?env_name=${encodeURIComponent(activeEnv)}&profile=${encodeURIComponent(profile)}`);
        if (res.ok) {
          const data = await res.json();
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setSelectedNode(null);
        }
      } catch (err) {
        console.error("Failed to load knowledge graph:", err);
      }
    };
    fetchGraph();
  }, [activeEnv, profile]);

  // Node color mapping
  const getNodeColor = (group: string) => {
    switch (group) {
      case "Facility": return "var(--color-success)";
      case "Barrier": return "var(--color-danger)";
      case "Preference": return "var(--color-warning)";
      default: return "var(--color-accent)";
    }
  };

  return (
    <div className="premium-card" style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "20px", color: "var(--color-accent)" }}>Interactive Spatial Knowledge Graph</h2>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{activeEnv}</span>
      </div>

      {/* SVG Canvas */}
      <div style={{
        width: "100%",
        height: "260px",
        background: "#080B11",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        position: "relative",
        overflow: "hidden"
      }}>
        <svg style={{ width: "100%", height: "100%" }} viewBox="-100 -200 700 450">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2A354A" />
            </marker>
          </defs>

          {/* Draw Edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromNode.x + 150}
                  y1={fromNode.y + 100}
                  x2={toNode.x + 150}
                  y2={toNode.y + 100}
                  stroke={edge.color}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2 + 150}
                  y={(fromNode.y + toNode.y) / 2 + 95}
                  fill="var(--text-muted)"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {edge.relation} ({edge.distance}m)
                </text>
              </g>
            );
          })}

          {/* Draw Nodes */}
          {nodes.map((node) => {
            const color = getNodeColor(node.group);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={node.x + 150}
                  cy={node.y + 100}
                  r={isSelected ? "18" : "14"}
                  fill="#181E29"
                  stroke={color}
                  strokeWidth={isSelected ? "4" : "2"}
                  style={{ transition: "var(--transition-smooth)" }}
                />
                <text
                  x={node.x + 150}
                  y={node.y + 130}
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Inspector */}
      <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", height: "80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {selectedNode ? (
          <div>
            <div style={{ fontWeight: "bold", color: getNodeColor(selectedNode.group), marginBottom: "4px" }}>
              {selectedNode.label} ({selectedNode.group})
            </div>
            <div>Accessibility Rating: <strong>{selectedNode.accessibility}%</strong></div>
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Click on any graph node to inspect details and relationship weights.
          </div>
        )}
      </div>

    </div>
  );
}
