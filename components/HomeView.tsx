"use client";

import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Package,
  ShoppingCart,
  Mail,
  BarChart3,
  RefreshCw,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { ThemeContext } from "@/lib/theme";
import { Button } from "@/components/Button";
import { InlineChat } from "@/components/InlineChat";
import { sidekickConfig } from "@/lib/quick-agent/config";

// ── Types ──────────────────────────────────────────────

type CardType = "order" | "alert" | "campaign" | "insight" | "sync" | "support";

interface DecisionCard {
  id: string;
  type: CardType;
  title: string;
  context: string;
  aiRecommendation: string;
  actions: { label: string; primary?: boolean; destructive?: boolean }[];
  urgency: "high" | "medium" | "low";
  meta?: string;
}

interface AgentTask {
  id: string;
  label: string;
  progress?: string;
}

interface HandledItem {
  id: string;
  label: string;
  time: string;
  type: CardType;
}

// ── Data ───────────────────────────────────────────────

const decisionCards: DecisionCard[] = [
  {
    id: "d1",
    type: "support",
    title: "Return request: Ceramic Planter Set",
    context: "Customer Sarah Mitchell — $892 lifetime value, 0 previous returns. Item arrived with visible cracks.",
    aiRecommendation: "Approve full refund + send replacement at no cost. High-value customer with clean history.",
    actions: [
      { label: "Approve", primary: true },
      { label: "Modify" },
      { label: "Reject", destructive: true },
    ],
    urgency: "high",
    meta: "Order #7291",
  },
  {
    id: "d2",
    type: "alert",
    title: "Widget Pro is about to stock out",
    context: "12 units left. Selling ~8/day. Estimated stockout in 1.5 days. Supplier lead time: 3-5 business days.",
    aiRecommendation: "Reorder 200 units from primary supplier now. Last unit cost: $14.20.",
    actions: [
      { label: "Reorder 200", primary: true },
      { label: "Adjust qty" },
      { label: "Dismiss" },
    ],
    urgency: "high",
    meta: "SKU: WP-2024",
  },
  {
    id: "d3",
    type: "campaign",
    title: "February Clearance email ready",
    context: "\"Up to 40% off\" — 2,847 subscribers. 6 featured products, free shipping over $50. Scheduled for Feb 7 at 9am.",
    aiRecommendation: "Predicted open rate: 24-28%. Click rate: 3.5-4.2%. Looks good to send.",
    actions: [
      { label: "Send now", primary: true },
      { label: "Edit draft" },
      { label: "Reschedule" },
    ],
    urgency: "medium",
    meta: "Email campaign",
  },
];

const agentTasks: AgentTask[] = [
  { id: "a1", label: "Processing order batch #483", progress: "18 of 23" },
  { id: "a2", label: "Generating weekly performance digest" },
];

const handledItems: HandledItem[] = [
  { id: "h1", label: "Weekly Analytics Report — revenue summary, acquisition metrics, inventory forecast", time: "12m ago", type: "insight" },
  { id: "h2", label: "Bulk Product Update — updated pricing on 47 products across 3 collections", time: "34m ago", type: "sync" },
  { id: "h3", label: "Inventory Discrepancy — 3 SKUs show negative available count, needs manual review", time: "1h ago", type: "alert" },
  { id: "h4", label: "Order #4821 payment retry — gateway timeout, retried successfully", time: "2h ago", type: "order" },
  { id: "h5", label: "Customer Segment Refresh — recalculated 12 dynamic segments, 2.4k customers re-evaluated", time: "3h ago", type: "sync" },
  { id: "h6", label: "End-of-day fulfillment batch — 18 orders queued for pickup scan at 5:00 PM", time: "Upcoming", type: "order" },
];

// ── Sidebar widget data ──────────────────────────────

var salesChannels = [
  { name: "Online Store", status: "active" as const },
  { name: "Point of Sale", status: "active" as const },
  { name: "Shop", status: "syncing" as const },
  { name: "Google & YouTube", status: "active" as const },
  { name: "Facebook & Instagram", status: "inactive" as const },
];

var CHANNEL_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#dcfce7", color: "#166534", label: "Active" },
  syncing: { bg: "#fef9c3", color: "#854d0e", label: "Syncing" },
  inactive: { bg: "#f3f4f6", color: "#6b7280", label: "Inactive" },
};

// ── Helpers ────────────────────────────────────────────

var TYPE_ICONS: Record<CardType, React.ReactNode> = {
  order: <ShoppingCart size={13} />,
  alert: <AlertTriangle size={13} />,
  campaign: <Mail size={13} />,
  insight: <BarChart3 size={13} />,
  sync: <RefreshCw size={13} />,
  support: <Package size={13} />,
};

var TYPE_COLORS: Record<CardType, { dot: string; text: string }> = {
  order: { dot: "#3b82f6", text: "#6b7280" },
  alert: { dot: "#f59e0b", text: "#6b7280" },
  campaign: { dot: "#8b5cf6", text: "#6b7280" },
  insight: { dot: "#10b981", text: "#6b7280" },
  sync: { dot: "#06b6d4", text: "#6b7280" },
  support: { dot: "#f97316", text: "#6b7280" },
};

// ── Components ─────────────────────────────────────────

function DecisionCardComponent({
  card,
  onAction,
  isLast,
}: {
  card: DecisionCard;
  onAction: (cardId: string, action: string) => void;
  isLast: boolean;
}) {
  var theme = useContext(ThemeContext);
  var colors = TYPE_COLORS[card.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="decision-row"
      style={{
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      {/* Title row with meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.dot,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, lineHeight: 1.3 }}>
          {card.title}
        </span>
        {card.meta && (
          <span style={{ fontSize: 11, color: theme.textDim, fontWeight: 400, flexShrink: 0 }}>
            {card.meta}
          </span>
        )}
      </div>

      {/* Context + AI recommendation merged */}
      <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5, marginBottom: 10, paddingLeft: 14 }}>
        {card.context}
        <span style={{ color: "#8b5cf6" }}>{" \u2014 "}</span>
        <span style={{ color: "#6b7280" }}>{card.aiRecommendation}</span>
      </div>

      {/* Actions — compact */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 14 }}>
        {card.actions.map(function (action) {
          var isPrimary = action.primary;

          if (isPrimary) {
            return (
              <Button
                key={action.label}
                size="xs"
                onClick={function () { onAction(card.id, action.label); }}
              >
                {action.label}
              </Button>
            );
          }

          return (
            <button
              key={action.label}
              onClick={function () { onAction(card.id, action.label); }}
              className="decision-btn"
              style={{
                height: 28,
                padding: "0 10px",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: theme.fontFamily,
                borderRadius: 10,
                border: "1px solid " + theme.borderLight,
                background: "transparent",
                color: "#9ca3af",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function AgentWorkingCard({ task }: { task: AgentTask }) {
  var theme = useContext(ThemeContext);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "#ffffff",
        border: "1px solid " + theme.borderDim,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#22c55e",
          flexShrink: 0,
          animation: "pulse-soft 2s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 13, color: theme.text, flex: 1 }}>{task.label}</span>
      {task.progress && (
        <span style={{ fontSize: 11, color: theme.textDim, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
          {task.progress}
        </span>
      )}
    </motion.div>
  );
}

function HandledChip({ item }: { item: HandledItem }) {
  var theme = useContext(ThemeContext);
  var colors = TYPE_COLORS[item.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 0",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: colors.dot,
          flexShrink: 0,
          opacity: 0.5,
        }}
      />
      <span style={{ fontSize: 12, color: theme.textMuted, flex: 1 }}>{item.label}</span>
      <span style={{ fontSize: 11, color: theme.textDim, flexShrink: 0, fontWeight: 500 }}>
        {item.time}
      </span>
    </div>
  );
}

// ── Sidebar widgets ───────────────────────────────────

function SidebarAgentCard() {
  var theme = useContext(ThemeContext);
  var config = sidekickConfig;
  var tools = config.tools || [];

  // Count active guardrails
  var guardrailCount = 0;
  if (config.gates) {
    if (config.gates.approval) guardrailCount++;
    if (config.gates.costThreshold != null) guardrailCount++;
  }

  return (
    <div
      style={{
        background: theme.cardBg,
        border: "1px solid " + theme.borderLight,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{config.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              animation: "pulse-soft 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#166534",
              background: "#dcfce7",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            Active
          </span>
        </div>
      </div>

      {/* Vitals row */}
      <div style={{ padding: "2px 16px 0", fontSize: 12, color: theme.textMuted }}>
        {"142 visitors \u00B7 3.2% conversion"}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: theme.borderLight, margin: "6px 16px 0" }} />

      {/* Capabilities row */}
      <div
        className="sidebar-row"
        style={{
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 12, color: theme.textMuted }}>Capabilities</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#1d4ed8",
              background: "#eff6ff",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {tools.length + " tools"}
          </span>
          <ChevronRight size={12} style={{ color: theme.textDim }} />
        </div>
      </div>

      {/* Guardrails row */}
      {config.gates && (
        <div
          className="sidebar-row"
          style={{
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 12, color: theme.textMuted }}>Guardrails</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#166534",
                background: "#dcfce7",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {guardrailCount + " active"}
            </span>
            <ChevronRight size={12} style={{ color: theme.textDim }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelsCard() {
  var theme = useContext(ThemeContext);

  var activeCount = salesChannels.filter(function (ch) { return ch.status === "active"; }).length;
  var totalCount = salesChannels.length;
  var nonActive = salesChannels.filter(function (ch) { return ch.status !== "active"; });

  return (
    <div
      style={{
        background: theme.cardBg,
        border: "1px solid " + theme.borderLight,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header with summary badge */}
      <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Sales Channels</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#166534",
            background: "#dcfce7",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {activeCount + " of " + totalCount + " active"}
        </span>
      </div>
      <div>
        {nonActive.length === 0 ? (
          <div style={{ padding: "7px 16px", fontSize: 12, color: theme.textMuted }}>
            All channels active
          </div>
        ) : (
          nonActive.map(function (ch) {
            var s = CHANNEL_STATUS_STYLES[ch.status];
            return (
              <div
                key={ch.name}
                className="sidebar-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 16px",
                }}
              >
                <span style={{ fontSize: 12, color: theme.textMuted }}>{ch.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: s.color,
                    background: s.bg,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  var theme = useContext(ThemeContext);
  var [cards, setCards] = useState(decisionCards);
  var [handledOpen, setHandledOpen] = useState(false);
  var [resolvedCards, setResolvedCards] = useState<{ id: string; title: string; action: string }[]>([]);

  var now = new Date();
  var hour = now.getHours();
  var greeting = hour < 12 ? "Good morning, Kazden" : hour < 18 ? "Good afternoon, Kazden" : "Good evening, Kazden";

  var needsYouCount = cards.length;

  var handleAction = function (cardId: string, action: string) {
    var card = cards.find(function (c) { return c.id === cardId; });
    if (!card) return;

    setResolvedCards(function (prev) {
      return [{ id: cardId, title: card!.title, action: action }].concat(prev);
    });
    setCards(function (prev) {
      return prev.filter(function (c) { return c.id !== cardId; });
    });
  };

  return (
    <div
      style={{
        flex: 1,
        fontFamily: theme.fontFamily,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{"\
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\
        @keyframes pulse-soft { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }\
        .decision-btn:hover { background: #f5f5f5 !important; color: #111827 !important; }\
        .decision-btn:first-child:hover { background: #374151 !important; color: #ffffff !important; }\
        .decision-row { transition: background 0.1s ease; border-radius: 10px; margin: 0 -12px; padding-left: 12px; padding-right: 12px; }\
        .decision-row:hover { background: #f9f9f9; }\
        .sidebar-row { transition: background 0.1s ease; }\
        .sidebar-row:hover { background: rgba(0,0,0,0.04); }\
      "}</style>

      {/* ── Scrollable body ──────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Two-column layout ─────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: 32,
            display: "flex",
            gap: 40,
          }}
        >
        {/* ── Left: greeting + chat + content ──────────── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Greeting + Embedded Chat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 600, color: theme.text, margin: "0 0 6px" }}>
              {greeting}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: theme.textMuted,
                marginBottom: 24,
              }}
            >
              <Zap size={12} style={{ color: theme.accent }} />
              <span>
                {"23 orders \u00B7 $3.8k revenue"}
                {needsYouCount > 0
                  ? " \u00B7 " + needsYouCount + " need" + (needsYouCount === 1 ? "s" : "") + " you"
                  : ""}
              </span>
            </div>
            <InlineChat embedded />
          </div>

          {/* Just resolved */}
          {resolvedCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <AnimatePresence>
                {resolvedCards.map(function (r) {
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#166534",
                      }}
                    >
                      <Check size={12} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, lineHeight: 1.4 }}>
                        {r.title} — <strong>{r.action}</strong>
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Needs you */}
          {cards.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                  Needs you
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6b7280",
                    background: "#f3f4f6",
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  {cards.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <AnimatePresence mode="popLayout">
                  {cards.map(function (card, i) {
                    return (
                      <DecisionCardComponent
                        key={card.id}
                        card={card}
                        onAction={handleAction}
                        isLast={i === cards.length - 1}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Zero state */}
          {cards.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f9fafb",
                borderRadius: 14,
                border: "1px solid " + theme.borderDim,
              }}
            >
              <Check
                size={28}
                style={{
                  color: theme.success,
                  marginBottom: 10,
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 4 }}>
                All clear
              </div>
              <div style={{ fontSize: 13, color: theme.textMuted }}>
                Nothing needs your attention. The agent is handling everything.
              </div>
            </motion.div>
          )}

          {/* Agent working */}
          {agentTasks.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                  Agent working
                </span>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: "#22c55e",
                    animation: "pulse-soft 2s ease-in-out infinite",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {agentTasks.map(function (task) {
                  return <AgentWorkingCard key={task.id} task={task} />;
                })}
              </div>
            </div>
          )}

          {/* Handled today */}
          <div>
            <button
              onClick={function () { setHandledOpen(!handledOpen); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                marginBottom: handledOpen ? 6 : 0,
                fontFamily: theme.fontFamily,
              }}
            >
              {handledOpen ? (
                <ChevronDown size={13} style={{ color: theme.textDim }} />
              ) : (
                <ChevronRight size={13} style={{ color: theme.textDim }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
                Handled today
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: theme.textDim,
                }}
              >
                {handledItems.length + resolvedCards.length}
              </span>
            </button>

            <AnimatePresence>
              {handledOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      paddingLeft: 16,
                      borderLeft: "1px solid " + theme.borderDim,
                      marginLeft: 6,
                    }}
                  >
                    {handledItems.map(function (item) {
                      return <HandledChip key={item.id} item={item} />;
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: widget sidebar ──────────────────── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 4,
          }}
        >
          <SidebarAgentCard />
          <ChannelsCard />
        </div>
        </div>
      </div>
    </div>
  );
}
