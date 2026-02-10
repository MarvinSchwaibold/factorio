"use client";

import { useState } from "react";
import { agents as defaultAgents } from "@/lib/skills";
import { AgentDetailView } from "./AgentDetailView";
import { SidekickIcon } from "./SidekickIcon";
import { Plus, X, BarChart3, PenTool, Headphones, Package, Zap } from "lucide-react";
import type { Agent } from "@/lib/skills";

var font = "var(--font-geist-sans), system-ui, -apple-system, sans-serif";

var agentIcons: Record<string, string> = {
  "merchant-analyst": "chart",
  "content-writer": "pen",
  "support-agent": "headphones",
  "inventory-planner": "package",
};

function AgentIcon({ agentId, size }: { agentId: string; size: number }) {
  if (agentId === "sidekick") return <SidekickIcon size={size} />;
  var iconType = agentIcons[agentId] || "zap";
  if (iconType === "chart") return <BarChart3 size={size} color="#7126ff" />;
  if (iconType === "pen") return <PenTool size={size} color="#7126ff" />;
  if (iconType === "headphones") return <Headphones size={size} color="#7126ff" />;
  if (iconType === "package") return <Package size={size} color="#7126ff" />;
  return <Zap size={size} color="#7126ff" />;
}

interface AgentsViewProps {
  sidebarWidth: number;
}

export function AgentsView({ sidebarWidth }: AgentsViewProps) {
  var [localAgents, setLocalAgents] = useState<Agent[]>(defaultAgents);
  var [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  var [isCreating, setIsCreating] = useState(false);
  var [newName, setNewName] = useState("");
  var [newDesc, setNewDesc] = useState("");
  var [newMarkdown, setNewMarkdown] = useState("");

  var connectedAgents: Agent[] = [];
  var availableAgents: Agent[] = [];
  for (var i = 0; i < localAgents.length; i++) {
    if (localAgents[i].connected) {
      connectedAgents.push(localAgents[i]);
    } else {
      availableAgents.push(localAgents[i]);
    }
  }

  var selectedAgent: Agent | null = null;
  for (var j = 0; j < localAgents.length; j++) {
    if (localAgents[j].id === selectedAgentId) {
      selectedAgent = localAgents[j];
      break;
    }
  }

  function handleUpdateAgent(updated: Agent) {
    setLocalAgents(localAgents.map(function (a) {
      return a.id === updated.id ? updated : a;
    }));
  }

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        sidebarWidth={sidebarWidth}
        onBack={function () {
          setSelectedAgentId(null);
        }}
        onUpdateAgent={handleUpdateAgent}
      />
    );
  }

  function handleCreate() {
    if (!newName.trim()) return;
    var id = newName.trim().toLowerCase().replace(/\s+/g, "-");
    var agent: Agent = {
      id: id,
      name: newName.trim(),
      description: newDesc.trim(),
      markdown: newMarkdown || "# " + newName.trim(),
      status: "Inactive",
      skills: [],
      connected: false,
    };
    setLocalAgents(localAgents.concat([agent]));
    setIsCreating(false);
    setNewName("");
    setNewDesc("");
    setNewMarkdown("");
    setSelectedAgentId(id);
  }

  return (
    <div
      style={{
        marginLeft: sidebarWidth,
        transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100vh",
        overflow: "auto",
        background: "#141414",
        padding: "48px 40px",
        fontFamily: font,
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e5e5e5", marginBottom: 32 }}>
        Agents
      </h1>

      {/* ── Available section ── */}
      <div style={{ marginBottom: 40 }}>
        {/* Create form */}
        {isCreating && (
          <div
            style={{
              border: "1px solid #2a2a2a", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", padding: "16px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5" }}>New Agent</div>
              <button
                onClick={function () { setIsCreating(false); setNewName(""); setNewDesc(""); setNewMarkdown(""); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: 5,
                  border: "1px solid #2a2a2a", background: "transparent",
                  color: "#666", cursor: "pointer", padding: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>
            <input
              value={newName}
              onChange={function (e) { setNewName(e.target.value); }}
              placeholder="Agent name"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none", marginBottom: 6,
              }}
            />
            <input
              value={newDesc}
              onChange={function (e) { setNewDesc(e.target.value); }}
              placeholder="Short description"
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none", marginBottom: 6,
              }}
            />
            <textarea
              value={newMarkdown}
              onChange={function (e) { setNewMarkdown(e.target.value); }}
              placeholder="Markdown content..."
              rows={6}
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6,
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#e5e5e5", fontSize: 13, fontFamily: "var(--font-geist-mono), monospace",
                lineHeight: 1.5, outline: "none", resize: "vertical", marginBottom: 10,
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              style={{
                padding: "6px 16px", borderRadius: 6, border: "none",
                background: newName.trim() ? "#e5e5e5" : "#333",
                color: newName.trim() ? "#141414" : "#666",
                fontSize: 12, fontWeight: 600, fontFamily: font,
                cursor: newName.trim() ? "pointer" : "default",
              }}
            >
              Create Agent
            </button>
          </div>
        )}

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {/* Create Agent card */}
          {!isCreating && (
            <button
              onClick={function () { setIsCreating(true); }}
              className="agent-card"
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: "16px",
                borderRadius: 10, minHeight: 110,
                border: "1px dashed #2a2a2a",
                background: "transparent",
                cursor: "pointer", fontFamily: font,
                transition: "transform 150ms ease, border-color 150ms ease",
                gap: 8,
              }}
            >
              <Plus size={18} color="#555" />
              <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Create Agent</span>
            </button>
          )}

          {availableAgents.map(function (agent) {
            return (
              <button
                key={agent.id}
                onClick={function () { setSelectedAgentId(agent.id); }}
                className="agent-card"
                style={{
                  display: "flex", flexDirection: "column",
                  textAlign: "left", padding: "16px",
                  borderRadius: 10,
                  border: "1px solid #2a2a2a",
                  background: "rgba(255,255,255,0.02)",
                  cursor: "pointer", fontFamily: font,
                  transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <AgentIcon agentId={agent.id} size={20} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5", marginBottom: 6 }}>
                  {agent.name}
                </div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.4, flex: 1 }}>
                  {agent.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Connected section ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5" }}>Connected</span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 20, height: 20, padding: "0 6px",
              borderRadius: 10, background: "rgba(255,255,255,0.08)",
              fontSize: 11, fontWeight: 600, color: "#999",
            }}
          >
            {connectedAgents.length}
          </span>
        </div>

        {connectedAgents.length === 0 ? (
          <div style={{ padding: "20px 0", color: "#555", fontSize: 13 }}>
            No connected agents yet. Browse the gallery above to get started.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                {["Name", "Description", "Status"].map(function (col) {
                  return (
                    <th
                      key={col}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        color: "#888",
                        fontWeight: 500,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {col}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {connectedAgents.map(function (agent) {
                return (
                  <tr
                    key={agent.id}
                    onClick={function () { setSelectedAgentId(agent.id); }}
                    style={{ borderBottom: "1px solid #1e1e1e", cursor: "pointer" }}
                    onMouseEnter={function (e) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={function (e) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "12px", color: "#e5e5e5", fontWeight: 500 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <AgentIcon agentId={agent.id} size={20} />
                        {agent.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#999" }}>{agent.description}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          color: agent.status === "Active" ? "#4ade80" : "#888",
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: agent.status === "Active" ? "#4ade80" : "#555",
                          }}
                        />
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .agent-card:hover {
          transform: translateY(-2px);
          border-color: #3a3a3a !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
      `}} />
    </div>
  );
}
