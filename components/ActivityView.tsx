"use client";

import { useState } from "react";
import { BarChart3, PenTool, Headphones, Package, Zap, ChevronRight } from "lucide-react";
import { SidekickIcon } from "./SidekickIcon";
import { agents as defaultAgents } from "@/lib/skills";
import { seedActivities } from "@/lib/activity";
import type { Activity } from "@/lib/activity";

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
  if (iconType === "chart") return <BarChart3 size={size} />;
  if (iconType === "pen") return <PenTool size={size} />;
  if (iconType === "headphones") return <Headphones size={size} />;
  if (iconType === "package") return <Package size={size} />;
  return <Zap size={size} />;
}

function getAgentName(agentId: string): string {
  for (var i = 0; i < defaultAgents.length; i++) {
    if (defaultAgents[i].id === agentId) return defaultAgents[i].name;
  }
  return agentId;
}

// Only flagged and awaiting_review get color — everything else is neutral
var typeConfig: Record<Activity["type"], { color: string; label: string }> = {
  completed: { color: "#555", label: "Completed" },
  started: { color: "#555", label: "Started" },
  flagged: { color: "#facc15", label: "Flagged" },
  awaiting_review: { color: "#f97316", label: "Needs review" },
  auto_action: { color: "#555", label: "Auto" },
};

function formatTime(timestamp: string): string {
  var then = new Date(timestamp);
  var h = then.getHours();
  var m = then.getMinutes();
  var ampm = h >= 12 ? "PM" : "AM";
  var hour = h % 12 || 12;
  var min = m < 10 ? "0" + m : "" + m;
  return hour + ":" + min + " " + ampm;
}

function getDayKey(timestamp: string): string {
  var d = new Date(timestamp);
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function getDayLabel(timestamp: string): string {
  var now = new Date();
  var then = new Date(timestamp);
  var todayKey = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  var yestDate = new Date(now.getTime() - 86400000);
  var yestKey = yestDate.getFullYear() + "-" + (yestDate.getMonth() + 1) + "-" + yestDate.getDate();
  var key = getDayKey(timestamp);
  if (key === todayKey) return "Today";
  if (key === yestKey) return "Yesterday";
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[then.getMonth()] + " " + then.getDate();
}

interface DayGroup {
  label: string;
  items: Activity[];
}

function groupByDay(activities: Activity[]): DayGroup[] {
  var groups: DayGroup[] = [];
  var currentKey = "";
  for (var i = 0; i < activities.length; i++) {
    var key = getDayKey(activities[i].timestamp);
    if (key !== currentKey) {
      groups.push({ label: getDayLabel(activities[i].timestamp), items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(activities[i]);
  }
  return groups;
}

interface ActivityViewProps {
  sidebarWidth: number;
  onNavigateToAgent?: (agentId: string) => void;
  onNavigateToWorkspace?: (workspaceId: string) => void;
}

export function ActivityView({ sidebarWidth, onNavigateToAgent, onNavigateToWorkspace }: ActivityViewProps) {
  var [filter, setFilter] = useState<"all" | "flagged" | "review">("all");

  var filtered: Activity[] = [];
  for (var i = 0; i < seedActivities.length; i++) {
    var a = seedActivities[i];
    if (filter === "all") filtered.push(a);
    else if (filter === "flagged" && a.type === "flagged") filtered.push(a);
    else if (filter === "review" && a.type === "awaiting_review") filtered.push(a);
  }

  var reviewCount = 0;
  var flaggedCount = 0;
  for (var j = 0; j < seedActivities.length; j++) {
    if (seedActivities[j].type === "awaiting_review") reviewCount++;
    if (seedActivities[j].type === "flagged") flaggedCount++;
  }

  var groups = groupByDay(filtered);

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
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 40px" }}>
        {/* Header */}
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e5e5e5", marginBottom: 8 }}>
          Activity
        </h1>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 24, lineHeight: 1.4 }}>
          What your agents have been up to.
        </p>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {([
            { key: "all" as const, label: "All", count: 0, countColor: "" },
            { key: "review" as const, label: "Needs review", count: reviewCount, countColor: "#f97316" },
            { key: "flagged" as const, label: "Flagged", count: flaggedCount, countColor: "#facc15" },
          ]).map(function (tab) {
            var active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={function () { setFilter(tab.key); }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: active ? "1px solid #333" : "1px solid transparent",
                  background: active ? "#1e1e1e" : "transparent",
                  color: active ? "#e5e5e5" : "#555",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: font,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "color 150ms ease, background 150ms ease",
                }}
                onMouseEnter={function (e) { if (!active) (e.currentTarget as HTMLElement).style.color = "#999"; }}
                onMouseLeave={function (e) { if (!active) (e.currentTarget as HTMLElement).style.color = "#555"; }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: tab.countColor,
                    borderRadius: 8,
                    padding: "1px 6px",
                    lineHeight: "16px",
                    background: tab.countColor + "18",
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        {groups.map(function (group, gi) {
          return (
            <div key={group.label} style={{ marginBottom: gi < groups.length - 1 ? 8 : 0 }}>
              {/* Day label */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                }}>
                  {group.label}
                </span>
                <div style={{ flex: 1, height: 1, background: "#222" }} />
              </div>

              {/* Events with timeline spine */}
              <div style={{ position: "relative", paddingLeft: 28 }}>
                {/* Vertical spine */}
                <div style={{
                  position: "absolute",
                  left: 4,
                  top: 4,
                  bottom: 4,
                  width: 1,
                  background: "#222",
                }} />

                {group.items.map(function (activity, ai) {
                  var config = typeConfig[activity.type];
                  var needsAttention = activity.type === "flagged" || activity.type === "awaiting_review";
                  var isLast = ai === group.items.length - 1;

                  return (
                    <div
                      key={activity.id}
                      style={{
                        position: "relative",
                        paddingBottom: isLast ? 24 : 0,
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{
                        position: "absolute",
                        left: -28 + 1,
                        top: 18,
                        width: needsAttention ? 9 : 7,
                        height: needsAttention ? 9 : 7,
                        borderRadius: "50%",
                        background: needsAttention ? config.color : "#333",
                        zIndex: 2,
                      }} />

                      {/* Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          padding: "10px 12px",
                          borderRadius: 8,
                          transition: "background 120ms ease",
                        }}
                        onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        {/* Time column */}
                        <span style={{
                          fontSize: 12,
                          color: "#444",
                          fontWeight: 500,
                          fontVariantNumeric: "tabular-nums",
                          width: 72,
                          flexShrink: 0,
                          paddingTop: 1,
                        }}>
                          {formatTime(activity.timestamp)}
                        </span>

                        {/* Agent avatar */}
                        <button
                          onClick={function () { if (onNavigateToAgent) onNavigateToAgent(activity.agentId); }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#1e1e1e",
                            border: "1px solid #2a2a2a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            cursor: onNavigateToAgent ? "pointer" : "default",
                            padding: 0,
                            color: "#888",
                            transition: "border-color 150ms ease",
                          }}
                          title={getAgentName(activity.agentId)}
                          onMouseEnter={function (e) { if (onNavigateToAgent) { (e.currentTarget as HTMLElement).style.borderColor = "#444"; } }}
                          onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; }}
                        >
                          <AgentIcon agentId={activity.agentId} size={13} />
                        </button>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Agent + title inline */}
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#999", flexShrink: 0 }}>
                              {getAgentName(activity.agentId)}
                            </span>
                            <span style={{ fontSize: 13, color: "#e5e5e5" }}>
                              {activity.title}
                            </span>
                          </div>

                          {/* Detail */}
                          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                            {activity.detail}
                          </div>

                          {/* Bottom row: workspace link + status label */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                            {needsAttention && (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: config.color,
                              }}>
                                {config.label}
                              </span>
                            )}
                            {activity.workspaceId && (
                              <button
                                onClick={function () { if (onNavigateToWorkspace) onNavigateToWorkspace(activity.workspaceId!); }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  padding: 0,
                                  border: "none",
                                  background: "transparent",
                                  color: "#444",
                                  fontSize: 11,
                                  fontWeight: 500,
                                  fontFamily: font,
                                  cursor: onNavigateToWorkspace ? "pointer" : "default",
                                  transition: "color 150ms ease",
                                }}
                                onMouseEnter={function (e) { if (onNavigateToWorkspace) { (e.currentTarget as HTMLElement).style.color = "#999"; } }}
                                onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.color = "#444"; }}
                              >
                                {activity.workspaceId.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); })}
                                <ChevronRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#555", fontSize: 13 }}>
            No activity matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
