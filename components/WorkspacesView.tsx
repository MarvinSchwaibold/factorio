"use client";

import { useState } from "react";
import { ChevronLeft, Plus, X, ChevronRight, BarChart3, PenTool, Headphones, Package, Zap } from "lucide-react";
import { SidekickIcon } from "./SidekickIcon";
import { agents as defaultAgents } from "@/lib/skills";
import type { Workspace, WorkspaceTask } from "@/lib/workspaces";
import { seedWorkspaces } from "@/lib/workspaces";

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

function getAgentName(agentId: string): string {
  for (var i = 0; i < defaultAgents.length; i++) {
    if (defaultAgents[i].id === agentId) return defaultAgents[i].name;
  }
  return agentId;
}

var columnLabels: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

var columnOrder: Array<"backlog" | "in_progress" | "review" | "done"> = ["backlog", "in_progress", "review", "done"];

interface WorkspacesViewProps {
  sidebarWidth: number;
  onNavigateToAgent?: (agentId: string) => void;
}

export function WorkspacesView({ sidebarWidth, onNavigateToAgent }: WorkspacesViewProps) {
  var [workspaces, setWorkspaces] = useState<Workspace[]>(seedWorkspaces);
  var [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  var [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  var [isCreating, setIsCreating] = useState(false);
  var [newName, setNewName] = useState("");
  var [newDesc, setNewDesc] = useState("");
  var [newIcon, setNewIcon] = useState("📋");

  // Add task form state
  var [isAddingTask, setIsAddingTask] = useState(false);
  var [newTaskTitle, setNewTaskTitle] = useState("");
  var [newTaskAgent, setNewTaskAgent] = useState("");

  var selectedWorkspace: Workspace | null = null;
  for (var i = 0; i < workspaces.length; i++) {
    if (workspaces[i].id === selectedWorkspaceId) {
      selectedWorkspace = workspaces[i];
      break;
    }
  }

  var selectedTask: WorkspaceTask | null = null;
  if (selectedWorkspace && selectedTaskId) {
    for (var j = 0; j < selectedWorkspace.tasks.length; j++) {
      if (selectedWorkspace.tasks[j].id === selectedTaskId) {
        selectedTask = selectedWorkspace.tasks[j];
        break;
      }
    }
  }

  function handleCreateWorkspace() {
    if (!newName.trim()) return;
    var id = newName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    var ws: Workspace = {
      id: id,
      name: newName.trim(),
      description: newDesc.trim(),
      icon: newIcon || "📋",
      agentIds: [],
      tasks: [],
    };
    setWorkspaces(workspaces.concat([ws]));
    setIsCreating(false);
    setNewName("");
    setNewDesc("");
    setNewIcon("📋");
    setSelectedWorkspaceId(id);
  }

  function handleAddTask() {
    if (!newTaskTitle.trim() || !selectedWorkspaceId) return;
    var taskId = "task-" + Date.now();
    var task: WorkspaceTask = {
      id: taskId,
      title: newTaskTitle.trim(),
      description: "",
      agentId: newTaskAgent || null,
      column: "backlog",
      output: "",
      createdAt: new Date().toISOString(),
    };
    setWorkspaces(workspaces.map(function (ws) {
      if (ws.id !== selectedWorkspaceId) return ws;
      return Object.assign({}, ws, { tasks: ws.tasks.concat([task]) });
    }));
    setNewTaskTitle("");
    setNewTaskAgent("");
    setIsAddingTask(false);
  }

  function handleMoveTask(taskId: string, newColumn: WorkspaceTask["column"]) {
    setWorkspaces(workspaces.map(function (ws) {
      if (ws.id !== selectedWorkspaceId) return ws;
      return Object.assign({}, ws, {
        tasks: ws.tasks.map(function (t) {
          return t.id === taskId ? Object.assign({}, t, { column: newColumn }) : t;
        }),
      });
    }));
  }

  function handleAssignAgent(taskId: string, agentId: string | null) {
    setWorkspaces(workspaces.map(function (ws) {
      if (ws.id !== selectedWorkspaceId) return ws;
      return Object.assign({}, ws, {
        tasks: ws.tasks.map(function (t) {
          return t.id === taskId ? Object.assign({}, t, { agentId: agentId }) : t;
        }),
      });
    }));
  }

  // ─── Kanban Detail View ───
  if (selectedWorkspace) {
    var tasksByColumn: Record<string, WorkspaceTask[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (var k = 0; k < selectedWorkspace.tasks.length; k++) {
      var col = selectedWorkspace.tasks[k].column;
      tasksByColumn[col].push(selectedWorkspace.tasks[k]);
    }

    return (
      <div
        style={{
          height: "100%",
          overflow: "hidden",
          background: "#141414",
          fontFamily: font,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #2a2a2a",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Top row: back button */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={function () { setSelectedWorkspaceId(null); setSelectedTaskId(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                border: "none", background: "transparent",
                color: "#999", cursor: "pointer", padding: 0,
                fontSize: 13, fontWeight: 500, fontFamily: font,
              }}
              onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.color = "#e5e5e5"; }}
              onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.color = "#999"; }}
            >
              <ChevronLeft size={16} />
              Workspaces
            </button>
          </div>
          {/* Title block: icon + name, description below */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{selectedWorkspace.icon}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#e5e5e5" }}>{selectedWorkspace.name}</span>
            </div>
            {selectedWorkspace.description && (
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.4, marginBottom: 12 }}>{selectedWorkspace.description}</div>
            )}
            {/* Connected agents row */}
            {selectedWorkspace.agentIds.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agents</span>
                {selectedWorkspace.agentIds.map(function (aid) {
                  return (
                    <button
                      key={aid}
                      onClick={function (e) { e.stopPropagation(); if (onNavigateToAgent) onNavigateToAgent(aid); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 10px", borderRadius: 8,
                        background: "rgba(113,38,255,0.08)", border: "1px solid rgba(113,38,255,0.2)",
                        cursor: onNavigateToAgent ? "pointer" : "default",
                        fontFamily: font,
                        transition: "background 150ms ease, border-color 150ms ease",
                      }}
                      onMouseEnter={function (e) { if (onNavigateToAgent) { (e.currentTarget as HTMLElement).style.background = "rgba(113,38,255,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(113,38,255,0.4)"; } }}
                      onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.background = "rgba(113,38,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(113,38,255,0.2)"; }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "rgba(113,38,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AgentIcon agentId={aid} size={12} />
                      </div>
                      <span style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{getAgentName(aid)}</span>
                      {onNavigateToAgent && <ChevronRight size={12} color="#555" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {columnOrder.map(function (colKey) {
            var tasks = tasksByColumn[colKey];
            return (
              <div
                key={colKey}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRight: colKey !== "done" ? "1px solid #1e1e1e" : "none",
                  background: "#1a1a1a",
                  overflow: "hidden",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderBottom: "1px solid #222",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {columnLabels[colKey]}
                  </span>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minWidth: 18, height: 18, padding: "0 5px",
                      borderRadius: 9, background: "rgba(255,255,255,0.06)",
                      fontSize: 11, fontWeight: 600, color: "#666",
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div style={{ flex: 1, overflow: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {tasks.map(function (task) {
                    var isSelected = selectedTaskId === task.id;
                    return (
                      <button
                        key={task.id}
                        onClick={function () { setSelectedTaskId(isSelected ? null : task.id); }}
                        className="agent-card"
                        style={{
                          display: "flex", flexDirection: "column",
                          textAlign: "left", padding: "12px",
                          borderRadius: 8,
                          border: isSelected ? "1px solid rgba(113,38,255,0.4)" : "1px solid #2a2a2a",
                          background: isSelected ? "rgba(113,38,255,0.06)" : "rgba(255,255,255,0.02)",
                          cursor: "pointer", fontFamily: font,
                          transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                          width: "100%",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#e5e5e5", lineHeight: 1.4 }}>{task.title}</span>
                        {task.description && (
                          <span style={{
                            fontSize: 12, color: "#666", lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as any,
                            overflow: "hidden",
                          }}>
                            {task.description}
                          </span>
                        )}
                        {task.agentId && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <AgentIcon agentId={task.agentId} size={12} />
                            <span style={{ fontSize: 11, color: "#888" }}>{getAgentName(task.agentId)}</span>
                          </div>
                        )}
                        {(colKey === "review" || colKey === "done") && task.output && (
                          <span style={{ fontSize: 11, color: "#7126ff", marginTop: 2 }}>View output</span>
                        )}
                      </button>
                    );
                  })}

                  {/* Add task button — only in backlog */}
                  {colKey === "backlog" && !isAddingTask && (
                    <button
                      onClick={function () { setIsAddingTask(true); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 12px", borderRadius: 8,
                        border: "1px dashed #2a2a2a", background: "transparent",
                        color: "#555", fontSize: 12, fontWeight: 500,
                        cursor: "pointer", fontFamily: font, width: "100%",
                        transition: "border-color 150ms ease, color 150ms ease",
                      }}
                      onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
                      onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.color = "#555"; }}
                    >
                      <Plus size={14} />
                      Add task
                    </button>
                  )}

                  {/* Inline add task form */}
                  {colKey === "backlog" && isAddingTask && (
                    <div
                      style={{
                        padding: 10, borderRadius: 8,
                        border: "1px solid #2a2a2a",
                        background: "rgba(255,255,255,0.02)",
                        display: "flex", flexDirection: "column", gap: 6,
                      }}
                    >
                      <input
                        value={newTaskTitle}
                        onChange={function (e) { setNewTaskTitle(e.target.value); }}
                        placeholder="Task title"
                        autoFocus
                        onKeyDown={function (e) { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") { setIsAddingTask(false); setNewTaskTitle(""); } }}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "6px 8px",
                          borderRadius: 5, border: "1px solid #2a2a2a",
                          background: "#141414", color: "#e5e5e5",
                          fontSize: 12, fontFamily: font, outline: "none",
                        }}
                      />
                      <select
                        value={newTaskAgent}
                        onChange={function (e) { setNewTaskAgent(e.target.value); }}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "5px 8px",
                          borderRadius: 5, border: "1px solid #2a2a2a",
                          background: "#141414", color: "#e5e5e5",
                          fontSize: 12, fontFamily: font, outline: "none",
                        }}
                      >
                        <option value="">Unassigned</option>
                        {defaultAgents.map(function (a) {
                          return <option key={a.id} value={a.id}>{a.name}</option>;
                        })}
                      </select>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={handleAddTask}
                          disabled={!newTaskTitle.trim()}
                          style={{
                            padding: "5px 12px", borderRadius: 5, border: "none",
                            background: newTaskTitle.trim() ? "#e5e5e5" : "#333",
                            color: newTaskTitle.trim() ? "#141414" : "#666",
                            fontSize: 11, fontWeight: 600, fontFamily: font,
                            cursor: newTaskTitle.trim() ? "pointer" : "default",
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={function () { setIsAddingTask(false); setNewTaskTitle(""); setNewTaskAgent(""); }}
                          style={{
                            padding: "5px 12px", borderRadius: 5,
                            border: "1px solid #2a2a2a", background: "transparent",
                            color: "#999", fontSize: 11, fontWeight: 500,
                            fontFamily: font, cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 400,
              height: "100vh",
              background: "#181818",
              borderLeft: "1px solid #2a2a2a",
              zIndex: 1100,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.4)",
            }}
          >
            {/* Panel Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>Task Detail</span>
              <button
                onClick={function () { setSelectedTaskId(null); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 26, height: 26, borderRadius: 6,
                  border: "1px solid #2a2a2a", background: "transparent",
                  color: "#666", cursor: "pointer", padding: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Panel Content */}
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e5e5e5", marginBottom: 8 }}>{selectedTask.title}</div>
              {selectedTask.description && (
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5, marginBottom: 16 }}>{selectedTask.description}</div>
              )}

              {/* Agent Assignment */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Assigned Agent</div>
                <select
                  value={selectedTask.agentId || ""}
                  onChange={function (e) { handleAssignAgent(selectedTask!.id, e.target.value || null); }}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "6px 10px",
                    borderRadius: 6, border: "1px solid #2a2a2a",
                    background: "#1a1a1a", color: "#e5e5e5",
                    fontSize: 13, fontFamily: font, outline: "none",
                  }}
                >
                  <option value="">Unassigned</option>
                  {defaultAgents.map(function (a) {
                    return <option key={a.id} value={a.id}>{a.name}</option>;
                  })}
                </select>
              </div>

              {/* Current Column */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Status</div>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 12,
                  background: selectedTask.column === "done" ? "rgba(74,222,128,0.1)" : selectedTask.column === "review" ? "rgba(113,38,255,0.1)" : selectedTask.column === "in_progress" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.06)",
                  color: selectedTask.column === "done" ? "#4ade80" : selectedTask.column === "review" ? "#a78bfa" : selectedTask.column === "in_progress" ? "#60a5fa" : "#888",
                  fontSize: 12, fontWeight: 500,
                }}>
                  {columnLabels[selectedTask.column]}
                </span>
              </div>

              {/* Move To buttons */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Move to</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {columnOrder.map(function (col) {
                    if (col === selectedTask!.column) return null;
                    return (
                      <button
                        key={col}
                        onClick={function () { handleMoveTask(selectedTask!.id, col); }}
                        style={{
                          padding: "5px 12px", borderRadius: 6,
                          border: "1px solid #2a2a2a", background: "transparent",
                          color: "#ccc", fontSize: 12, fontWeight: 500,
                          fontFamily: font, cursor: "pointer",
                          transition: "border-color 150ms ease, background 150ms ease",
                        }}
                        onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                        {columnLabels[col]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output */}
              {selectedTask.output && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Agent Output</div>
                  <div
                    style={{
                      padding: 14, borderRadius: 8,
                      background: "#141414", border: "1px solid #2a2a2a",
                      fontSize: 13, color: "#ccc", lineHeight: 1.6,
                      whiteSpace: "pre-wrap", fontFamily: font,
                    }}
                  >
                    {selectedTask.output}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: "\n          .agent-card:hover {\n            transform: translateY(-1px);\n            border-color: #3a3a3a !important;\n            box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n          }\n        " }} />
      </div>
    );
  }

  // ─── Workspace List View ───
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "#141414",
        padding: "48px 40px",
        fontFamily: font,
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e5e5e5", marginBottom: 32 }}>
        Workspaces
      </h1>

      {/* Create form */}
      {isCreating && (
        <div
          style={{
            border: "1px solid #2a2a2a", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5" }}>New Workspace</div>
            <button
              onClick={function () { setIsCreating(false); setNewName(""); setNewDesc(""); setNewIcon("📋"); }}
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
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input
              value={newIcon}
              onChange={function (e) { setNewIcon(e.target.value); }}
              style={{
                width: 42, padding: "7px 6px", borderRadius: 6, textAlign: "center",
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#e5e5e5", fontSize: 16, fontFamily: font, outline: "none",
              }}
            />
            <input
              value={newName}
              onChange={function (e) { setNewName(e.target.value); }}
              placeholder="Workspace name"
              autoFocus
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 6,
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none",
              }}
            />
          </div>
          <input
            value={newDesc}
            onChange={function (e) { setNewDesc(e.target.value); }}
            placeholder="Short description"
            style={{
              width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 6,
              border: "1px solid #2a2a2a", background: "#1a1a1a",
              color: "#e5e5e5", fontSize: 13, fontFamily: font, outline: "none", marginBottom: 10,
            }}
          />
          <button
            onClick={handleCreateWorkspace}
            disabled={!newName.trim()}
            style={{
              padding: "6px 16px", borderRadius: 6, border: "none",
              background: newName.trim() ? "#e5e5e5" : "#333",
              color: newName.trim() ? "#141414" : "#666",
              fontSize: 12, fontWeight: 600, fontFamily: font,
              cursor: newName.trim() ? "pointer" : "default",
            }}
          >
            Create Workspace
          </button>
        </div>
      )}

      {/* Card Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {/* Create Workspace card */}
        {!isCreating && (
          <button
            onClick={function () { setIsCreating(true); }}
            className="agent-card"
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: 20,
              borderRadius: 10, minHeight: 160,
              border: "1px dashed #2a2a2a",
              background: "transparent",
              cursor: "pointer", fontFamily: font,
              transition: "transform 150ms ease, border-color 150ms ease",
              gap: 8,
            }}
          >
            <Plus size={18} color="#555" />
            <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Create Workspace</span>
          </button>
        )}

        {/* Workspace cards */}
        {workspaces.map(function (ws) {
          var totalTasks = ws.tasks.length;
          var doneTasks = 0;
          var inProgressTasks = 0;
          var reviewTasks = 0;
          for (var t = 0; t < ws.tasks.length; t++) {
            if (ws.tasks[t].column === "done") doneTasks++;
            if (ws.tasks[t].column === "in_progress") inProgressTasks++;
            if (ws.tasks[t].column === "review") reviewTasks++;
          }
          var progressPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

          var summaryParts: string[] = [];
          if (inProgressTasks > 0) summaryParts.push(inProgressTasks + " in progress");
          if (reviewTasks > 0) summaryParts.push(reviewTasks + " in review");
          if (doneTasks > 0) summaryParts.push(doneTasks + " done");
          var summaryText = summaryParts.length > 0 ? summaryParts.join(" \u00B7 ") : "No tasks yet";

          return (
            <button
              key={ws.id}
              onClick={function () { setSelectedWorkspaceId(ws.id); }}
              className="agent-card"
              style={{
                display: "flex", flexDirection: "column",
                textAlign: "left", padding: 20,
                borderRadius: 10,
                border: "1px solid #2a2a2a",
                background: "rgba(255,255,255,0.02)",
                cursor: "pointer", fontFamily: font,
                transition: "transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
                minHeight: 160,
                gap: 0,
              }}
            >
              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{ws.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>{ws.name}</span>
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: "#777", lineHeight: 1.4, flex: 1, marginBottom: 12 }}>
                {ws.description}
              </div>

              {/* Agent avatars */}
              {ws.agentIds.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                  {ws.agentIds.map(function (aid) {
                    return (
                      <div
                        key={aid}
                        title={getAgentName(aid)}
                        style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: "rgba(113,38,255,0.12)",
                          border: "1px solid rgba(113,38,255,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <AgentIcon agentId={aid} size={12} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progress bar */}
              {totalTasks > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ height: 3, borderRadius: 2, background: "#2a2a2a", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: progressPct + "%", background: "#4ade80", borderRadius: 2, transition: "width 300ms ease" }} />
                  </div>
                </div>
              )}

              {/* Task summary */}
              <div style={{ fontSize: 11, color: "#555" }}>
                {summaryText}
              </div>
            </button>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: "\n        .agent-card:hover {\n          transform: translateY(-2px);\n          border-color: #3a3a3a !important;\n          box-shadow: 0 4px 12px rgba(0,0,0,0.3);\n        }\n      " }} />
    </div>
  );
}
