"use client";

import { useState } from "react";
import { agents } from "@/lib/skills";
import { AgentDetailView } from "./AgentDetailView";
import type { Agent } from "@/lib/skills";

interface AgentsViewProps {
  sidebarWidth: number;
}

export function AgentsView({ sidebarWidth }: AgentsViewProps) {
  var [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  var selectedAgent: Agent | null = null;
  for (var i = 0; i < agents.length; i++) {
    if (agents[i].id === selectedAgentId) {
      selectedAgent = agents[i];
      break;
    }
  }

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        sidebarWidth={sidebarWidth}
        onBack={function () {
          setSelectedAgentId(null);
        }}
      />
    );
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
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e5e5e5", marginBottom: 24 }}>
        Agents
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
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
          {agents.map(function (agent) {
            return (
              <tr
                key={agent.id}
                onClick={function () {
                  setSelectedAgentId(agent.id);
                }}
                style={{
                  borderBottom: "1px solid #1e1e1e",
                  cursor: "pointer",
                }}
                onMouseEnter={function (e) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={function (e) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <td style={{ padding: "12px", color: "#e5e5e5", fontWeight: 500 }}>
                  {agent.name}
                </td>
                <td style={{ padding: "12px", color: "#999" }}>
                  {agent.description}
                </td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: agent.status === "Active" ? "#4ade80" : "#888",
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
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
    </div>
  );
}
