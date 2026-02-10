"use client";

import { useState } from "react";
import { ChevronLeft, FileText, Eye, Plus, X, Zap, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SidekickIcon } from "./SidekickIcon";
import type { Agent, Skill } from "@/lib/skills";

interface AgentDetailViewProps {
  agent: Agent;
  sidebarWidth: number;
  onBack: () => void;
}

var font = "var(--font-geist-sans), system-ui, sans-serif";

function ViewToggle({
  viewMode,
  onChangeMode,
}: {
  viewMode: "rendered" | "source";
  onChangeMode: (mode: "rendered" | "source") => void;
}) {
  return (
    <div style={{ display: "flex", gap: 0 }}>
      <button
        onClick={function () { onChangeMode("rendered"); }}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: "4px 0 0 4px",
          border: "1px solid #333",
          background: viewMode === "rendered" ? "#333" : "transparent",
          color: viewMode === "rendered" ? "#e5e5e5" : "#666",
          cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: font,
        }}
      >
        <Eye size={11} /> Rendered
      </button>
      <button
        onClick={function () { onChangeMode("source"); }}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: "0 4px 4px 0",
          border: "1px solid #333", borderLeft: "none",
          background: viewMode === "source" ? "#333" : "transparent",
          color: viewMode === "source" ? "#e5e5e5" : "#666",
          cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: font,
        }}
      >
        <FileText size={11} /> Source
      </button>
    </div>
  );
}

function MarkdownContent({ markdown, viewMode }: { markdown: string; viewMode: "rendered" | "source" }) {
  if (viewMode === "source") {
    return (
      <pre style={{
        margin: 0, fontSize: 13, lineHeight: 1.6, color: "#aaa",
        fontFamily: "var(--font-geist-mono), monospace",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        padding: "14px", background: "rgba(255,255,255,0.02)",
        border: "1px solid #2a2a2a", borderRadius: 8,
      }}>
        {markdown}
      </pre>
    );
  }
  return (
    <div className="skill-markdown">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export function AgentDetailView({ agent, sidebarWidth, onBack }: AgentDetailViewProps) {
  var [activeTab, setActiveTab] = useState<"general" | "skills">("general");
  var [overviewMode, setOverviewMode] = useState<"rendered" | "source">("rendered");
  var [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  var [skillViewMode, setSkillViewMode] = useState<"rendered" | "source">("rendered");
  var [localSkills, setLocalSkills] = useState<Skill[]>(agent.skills);
  var [isCreating, setIsCreating] = useState(false);
  var [newName, setNewName] = useState("");
  var [newDesc, setNewDesc] = useState("");
  var [newMarkdown, setNewMarkdown] = useState("");

  function toggleSkill(skillId: string) {
    if (expandedSkillId === skillId) {
      setExpandedSkillId(null);
    } else {
      setExpandedSkillId(skillId);
      setSkillViewMode("rendered");
    }
  }

  var tabs = [
    { id: "general" as const, label: "General" },
    { id: "skills" as const, label: "Skills" },
  ];

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
      {/* Hero area */}
      <div
        style={{
          background: "linear-gradient(180deg, #1a1028 0%, #141414 100%)",
          borderBottom: "1px solid #1e1e1e",
          paddingBottom: 0,
        }}
      >
        <div style={{ maxWidth: 1120, marginLeft: "auto", marginRight: "auto", padding: "0 40px" }}>
          {/* Back button */}
          <div style={{ paddingTop: 20, paddingBottom: 24 }}>
            <button
              onClick={onBack}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px 5px 6px", borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                color: "#999", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: font,
              }}
              onMouseEnter={function (e) {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.color = "#e5e5e5";
              }}
              onMouseLeave={function (e) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#999";
              }}
            >
              <ChevronLeft size={14} />
              Agents
            </button>
          </div>

          {/* Agent identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 20 }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: 16,
                background: "linear-gradient(135deg, #2d1b69 0%, #1a1028 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(113, 38, 255, 0.15), 0 0 0 1px rgba(113, 38, 255, 0.1)",
                flexShrink: 0,
              }}
            >
              {agent.id === "sidekick" ? <SidekickIcon size={40} /> : (
                <Zap size={28} color="#7126ff" />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>
                  {agent.name}
                </h1>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "2px 8px", borderRadius: 10,
                    background: agent.status === "Active" ? "rgba(74, 222, 128, 0.1)" : "rgba(255,255,255,0.05)",
                    color: agent.status === "Active" ? "#4ade80" : "#888",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: agent.status === "Active" ? "#4ade80" : "#555",
                  }} />
                  {agent.status}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.4 }}>
                {agent.description}
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(function (tab) {
              var isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={function () { setActiveTab(tab.id); }}
                  style={{
                    padding: "10px 20px",
                    border: "none", background: "transparent",
                    color: isActive ? "#f0f0f0" : "#666",
                    fontSize: 13, fontWeight: 500, fontFamily: font,
                    cursor: "pointer",
                    borderBottom: isActive ? "2px solid #7126ff" : "2px solid transparent",
                    transition: "color 150ms ease, border-color 150ms ease",
                  }}
                  onMouseEnter={function (e) {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#aaa";
                  }}
                  onMouseLeave={function (e) {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#666";
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1120, marginLeft: "auto", marginRight: "auto", padding: "28px 40px 48px" }}>

        {/* ── General tab ── */}
        {activeTab === "general" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
            {/* Overview markdown */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Overview
                </div>
                <ViewToggle viewMode={overviewMode} onChangeMode={setOverviewMode} />
              </div>
              <MarkdownContent markdown={agent.markdown} viewMode={overviewMode} />
            </div>

            {/* Metadata sidebar */}
            <div style={{
              border: "1px solid #222", borderRadius: 10,
              background: "rgba(255,255,255,0.015)", padding: "16px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                Configuration
              </div>
              {[
                { label: "Status", value: agent.status },
                { label: "Skills", value: String(localSkills.length) },
                { label: "Model", value: "gpt-5.1" },
                { label: "Tools", value: "6 categories" },
                { label: "Data scope", value: "Current store" },
              ].map(function (row) {
                return (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #1e1e1e",
                  }}>
                    <span style={{ fontSize: 12, color: "#777" }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{row.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Skills tab ── */}
        {activeTab === "skills" && (
          <div>
            {/* Create form */}
            {isCreating && (
              <div style={{
                border: "1px solid #2a2a2a", borderRadius: 10,
                background: "rgba(255,255,255,0.02)", padding: "16px",
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5" }}>New Skill</div>
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
                  value={newName} onChange={function (e) { setNewName(e.target.value); }}
                  placeholder="Skill name" autoFocus
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
                    border: "1px solid #2a2a2a", background: "#1a1a1a",
                    color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none", marginBottom: 6,
                  }}
                />
                <input
                  value={newDesc} onChange={function (e) { setNewDesc(e.target.value); }}
                  placeholder="Short description"
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
                    border: "1px solid #2a2a2a", background: "#1a1a1a",
                    color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none", marginBottom: 6,
                  }}
                />
                <textarea
                  value={newMarkdown} onChange={function (e) { setNewMarkdown(e.target.value); }}
                  placeholder="Markdown content..." rows={6}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 6,
                    border: "1px solid #2a2a2a", background: "#1a1a1a",
                    color: "#e5e5e5", fontSize: 13, fontFamily: "var(--font-geist-mono), monospace",
                    lineHeight: 1.5, outline: "none", resize: "vertical", marginBottom: 10,
                  }}
                />
                <button
                  onClick={function () {
                    if (!newName.trim()) return;
                    var id = newName.trim().toLowerCase().replace(/\s+/g, "-");
                    var skill: Skill = { id: id, name: newName.trim(), description: newDesc.trim(), markdown: newMarkdown };
                    setLocalSkills(localSkills.concat([skill]));
                    setIsCreating(false); setNewName(""); setNewDesc(""); setNewMarkdown("");
                    setExpandedSkillId(id); setSkillViewMode("rendered");
                  }}
                  disabled={!newName.trim()}
                  style={{
                    padding: "6px 16px", borderRadius: 6, border: "none",
                    background: newName.trim() ? "#e5e5e5" : "#333",
                    color: newName.trim() ? "#141414" : "#666",
                    fontSize: 12, fontWeight: 600, fontFamily: font,
                    cursor: newName.trim() ? "pointer" : "default",
                  }}
                >
                  Add Skill
                </button>
              </div>
            )}

            {/* Skills grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}>
              {/* Add skill card — always first */}
              {!isCreating && (
                <button
                  onClick={function () { setIsCreating(true); }}
                  className="skill-card"
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
                  <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Add Skill</span>
                </button>
              )}

              {localSkills.map(function (skill) {
                var isExpanded = expandedSkillId === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={function () { toggleSkill(skill.id); }}
                    className="skill-card"
                    style={{
                      display: "flex", flexDirection: "column",
                      textAlign: "left", padding: "16px",
                      borderRadius: 10,
                      border: isExpanded ? "1px solid rgba(113, 38, 255, 0.3)" : "1px solid #2a2a2a",
                      background: isExpanded ? "rgba(113, 38, 255, 0.06)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer", fontFamily: font,
                      transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#7126ff",
                      boxShadow: "0 0 8px rgba(113, 38, 255, 0.4)",
                      marginBottom: 12,
                    }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5", marginBottom: 6 }}>
                      {skill.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#777", lineHeight: 1.4, flex: 1 }}>
                      {skill.description}
                    </div>
                  </button>
                );
              })}

            </div>

            {/* Expanded skill detail below grid */}
            {expandedSkillId && (function () {
              var skill: Skill | null = null;
              for (var i = 0; i < localSkills.length; i++) {
                if (localSkills[i].id === expandedSkillId) { skill = localSkills[i]; break; }
              }
              if (!skill) return null;
              return (
                <div style={{
                  marginTop: 16, border: "1px solid #2a2a2a", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", padding: "20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#7126ff",
                        boxShadow: "0 0 8px rgba(113, 38, 255, 0.4)",
                      }} />
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#e5e5e5" }}>{skill.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ViewToggle viewMode={skillViewMode} onChangeMode={setSkillViewMode} />
                      <button
                        onClick={function () {
                          var id = expandedSkillId;
                          setExpandedSkillId(null);
                          setLocalSkills(localSkills.filter(function (s) { return s.id !== id; }));
                        }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 22, height: 22, borderRadius: 5,
                          border: "1px solid #2a2a2a", background: "transparent",
                          color: "#555", cursor: "pointer", padding: 0,
                        }}
                        onMouseEnter={function (e) {
                          (e.currentTarget as HTMLElement).style.color = "#ef4444";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
                        }}
                        onMouseLeave={function (e) {
                          (e.currentTarget as HTMLElement).style.color = "#555";
                          (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                        }}
                        title="Delete skill"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={function () { setExpandedSkillId(null); }}
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
                  </div>
                  <MarkdownContent markdown={skill.markdown} viewMode={skillViewMode} />
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .skill-card:hover {
          transform: translateY(-2px);
          border-color: #3a3a3a !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .skill-markdown {
          color: #ccc; font-size: 14px; line-height: 1.7;
        }
        .skill-markdown h1 {
          font-size: 18px; font-weight: 700; color: #e5e5e5;
          margin: 0 0 14px 0; padding-bottom: 10px; border-bottom: 1px solid #2a2a2a;
        }
        .skill-markdown h2 {
          font-size: 15px; font-weight: 600; color: #ddd; margin: 20px 0 10px 0;
        }
        .skill-markdown h3 {
          font-size: 14px; font-weight: 600; color: #ccc; margin: 16px 0 8px 0;
        }
        .skill-markdown p { margin: 0 0 12px 0; }
        .skill-markdown ul { margin: 0 0 12px 0; padding-left: 20px; }
        .skill-markdown li { margin-bottom: 5px; color: #bbb; }
        .skill-markdown strong { color: #e5e5e5; font-weight: 600; }
        .skill-markdown code {
          font-size: 13px; background: #222; padding: 2px 6px; border-radius: 4px;
          color: #ddd; font-family: var(--font-geist-mono), monospace;
        }
        .skill-markdown table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
        .skill-markdown th {
          text-align: left; padding: 8px 10px; border-bottom: 1px solid #333;
          color: #999; font-weight: 500; font-size: 12px;
        }
        .skill-markdown td { padding: 8px 10px; border-bottom: 1px solid #1e1e1e; color: #bbb; }
        .skill-markdown hr { border: none; border-top: 1px solid #2a2a2a; margin: 16px 0; }
      `}} />
    </div>
  );
}
