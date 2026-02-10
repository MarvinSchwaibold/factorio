"use client";

import { useState } from "react";
import { ChevronLeft, FileText, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Agent, Skill } from "@/lib/skills";

interface AgentDetailViewProps {
  agent: Agent;
  sidebarWidth: number;
  onBack: () => void;
}

var font = "var(--font-geist-sans), system-ui, sans-serif";

export function AgentDetailView({ agent, sidebarWidth, onBack }: AgentDetailViewProps) {
  var [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  var [viewMode, setViewMode] = useState<"rendered" | "source">("rendered");

  var selectedSkill: Skill | null = null;
  for (var i = 0; i < agent.skills.length; i++) {
    if (agent.skills[i].id === selectedSkillId) {
      selectedSkill = agent.skills[i];
      break;
    }
  }

  return (
    <div
      style={{
        marginLeft: sidebarWidth,
        transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100vh",
        overflow: "auto",
        background: "#141414",
        fontFamily: font,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "20px 40px 0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={selectedSkill ? function () { setSelectedSkillId(null); setViewMode("rendered"); } : onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px 5px 6px",
            borderRadius: 6,
            border: "1px solid #2a2a2a",
            background: "transparent",
            color: "#999",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: font,
          }}
          onMouseEnter={function (e) {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "#e5e5e5";
          }}
          onMouseLeave={function (e) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#999";
          }}
        >
          <ChevronLeft size={14} />
          {selectedSkill ? agent.name : "Agents"}
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: "20px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e5e5e5", margin: 0 }}>
            {selectedSkill ? selectedSkill.name : agent.name}
          </h1>
          {!selectedSkill && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: agent.status === "Active" ? "#4ade80" : "#888",
                fontSize: 12,
                fontWeight: 500,
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
          )}
        </div>
        {!selectedSkill && (
          <p style={{ fontSize: 14, color: "#777", margin: 0 }}>
            {agent.description}
          </p>
        )}
        {selectedSkill && (
          <p style={{ fontSize: 14, color: "#777", margin: 0 }}>
            {selectedSkill.description}
          </p>
        )}
      </div>

      {!selectedSkill ? (
        /* Skills list */
        <div style={{ padding: "24px 40px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}
          >
            Skills ({agent.skills.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {agent.skills.map(function (skill) {
              return (
                <button
                  key={skill.id}
                  onClick={function () {
                    setSelectedSkillId(skill.id);
                  }}
                  style={{
                    display: "block",
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 8,
                    border: "1px solid #2a2a2a",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    fontFamily: font,
                    maxWidth: 560,
                  }}
                  onMouseEnter={function (e) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a";
                  }}
                  onMouseLeave={function (e) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#e5e5e5",
                      marginBottom: 4,
                    }}
                  >
                    {skill.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#777",
                      lineHeight: 1.4,
                    }}
                  >
                    {skill.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Skill detail */
        <div style={{ padding: "16px 40px 48px" }}>
          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 20,
            }}
          >
            <button
              onClick={function () {
                setViewMode("rendered");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: "5px 0 0 5px",
                border: "1px solid #333",
                background: viewMode === "rendered" ? "#333" : "transparent",
                color: viewMode === "rendered" ? "#e5e5e5" : "#777",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: font,
              }}
            >
              <Eye size={13} />
              Rendered
            </button>
            <button
              onClick={function () {
                setViewMode("source");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: "0 5px 5px 0",
                border: "1px solid #333",
                borderLeft: "none",
                background: viewMode === "source" ? "#333" : "transparent",
                color: viewMode === "source" ? "#e5e5e5" : "#777",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: font,
              }}
            >
              <FileText size={13} />
              Source
            </button>
          </div>

          {/* Content */}
          <div style={{ maxWidth: 640 }}>
            {viewMode === "rendered" ? (
              <div className="skill-markdown">
                <ReactMarkdown>{selectedSkill.markdown}</ReactMarkdown>
              </div>
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#aaa",
                  fontFamily: "var(--font-geist-mono), monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #2a2a2a",
                  borderRadius: 8,
                }}
              >
                {selectedSkill.markdown}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Markdown styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .skill-markdown {
          color: #ccc;
          font-size: 14px;
          line-height: 1.7;
        }
        .skill-markdown h1 {
          font-size: 18px;
          font-weight: 700;
          color: #e5e5e5;
          margin: 0 0 14px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #2a2a2a;
        }
        .skill-markdown h2 {
          font-size: 15px;
          font-weight: 600;
          color: #ddd;
          margin: 20px 0 10px 0;
        }
        .skill-markdown h3 {
          font-size: 14px;
          font-weight: 600;
          color: #ccc;
          margin: 16px 0 8px 0;
        }
        .skill-markdown p {
          margin: 0 0 12px 0;
        }
        .skill-markdown ul {
          margin: 0 0 12px 0;
          padding-left: 20px;
        }
        .skill-markdown li {
          margin-bottom: 5px;
          color: #bbb;
        }
        .skill-markdown strong {
          color: #e5e5e5;
          font-weight: 600;
        }
        .skill-markdown code {
          font-size: 13px;
          background: #222;
          padding: 2px 6px;
          border-radius: 4px;
          color: #ddd;
          font-family: var(--font-geist-mono), monospace;
        }
        .skill-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 13px;
        }
        .skill-markdown th {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 1px solid #333;
          color: #999;
          font-weight: 500;
          font-size: 12px;
        }
        .skill-markdown td {
          padding: 8px 10px;
          border-bottom: 1px solid #1e1e1e;
          color: #bbb;
        }
        .skill-markdown hr {
          border: none;
          border-top: 1px solid #2a2a2a;
          margin: 16px 0;
        }
      `,
        }}
      />
    </div>
  );
}
