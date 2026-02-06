"use client";

import { useState, useContext } from "react";
import { ThemeContext } from "@/lib/theme";

interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
}

const messages: InboxMessage[] = [
  {
    id: "1",
    sender: "Sidekick Agent",
    subject: "Order batch #482 processed",
    preview: "Successfully processed 23 orders with 0 errors. Revenue captured: $3,847.00.",
    body: "Successfully processed 23 orders with 0 errors.\n\nRevenue captured: $3,847.00\nAverage order value: $167.26\nFulfillment queued: 23 orders\n\nAll orders have been routed to the fulfillment pipeline. No manual intervention required.\n\nBreakdown:\n- Standard shipping: 18 orders\n- Express shipping: 4 orders\n- Local pickup: 1 order",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    sender: "Inventory Monitor",
    subject: "Low stock alert: Widget Pro",
    preview: "Widget Pro (SKU: WP-2024) has dropped below the reorder threshold.",
    body: "Widget Pro (SKU: WP-2024) has dropped below the reorder threshold.\n\nCurrent stock: 12 units\nReorder threshold: 25 units\nAvg. daily sales: 8 units\nEstimated stockout: 1.5 days\n\nRecommended action: Reorder 200 units from primary supplier.\n\nSupplier lead time: 3-5 business days\nLast reorder: Jan 15, 2026\nLast unit cost: $14.20",
    time: "18m ago",
    unread: true,
  },
  {
    id: "3",
    sender: "Customer Support",
    subject: "Escalation: Return request #1094",
    preview: "Customer requesting return for damaged item. Agent flagged for manual review.",
    body: "Customer requesting return for damaged item. Agent flagged for manual review.\n\nOrder: #7291\nCustomer: Sarah Mitchell\nItem: Ceramic Planter Set (x2)\nReason: Arrived with visible cracks\n\nCustomer sentiment: Frustrated but polite\nPrevious returns: 0\nLifetime value: $892.00\n\nAgent recommendation: Approve full refund + send replacement at no cost. High-value customer with clean history.",
    time: "34m ago",
    unread: false,
  },
  {
    id: "4",
    sender: "Sidekick Agent",
    subject: "Weekly performance digest",
    preview: "Your store performance summary for the week of Jan 27 - Feb 2.",
    body: "Your store performance summary for the week of Jan 27 - Feb 2.\n\nRevenue: $14,291 (+12% vs last week)\nOrders: 128 (+8%)\nConversion rate: 3.2% (+0.4pp)\nAvg. order value: $111.65 (+3%)\n\nTop products:\n1. Widget Pro - 47 units\n2. Ceramic Planter Set - 31 units\n3. Bamboo Desk Organizer - 28 units\n\nAgent actions this week:\n- 6 workflows completed autonomously\n- 2 escalations requiring approval\n- 0 failed tasks",
    time: "1h ago",
    unread: false,
  },
  {
    id: "5",
    sender: "Integration Status",
    subject: "Shopify sync completed",
    preview: "Product catalog sync finished. 847 products updated, 3 new products added.",
    body: "Product catalog sync finished.\n\n847 products updated\n3 new products added\n0 products removed\n2 price changes detected\n\nSync duration: 42 seconds\nNext scheduled sync: Tomorrow at 6:00 AM\n\nPrice changes:\n- Widget Pro: $29.99 -> $32.99\n- Bamboo Desk Organizer: $24.99 -> $22.99 (sale price applied)",
    time: "2h ago",
    unread: false,
  },
  {
    id: "6",
    sender: "Sidekick Agent",
    subject: "Email campaign draft ready",
    preview: "Draft for 'February Clearance' campaign is ready for your review.",
    body: "Draft for 'February Clearance' campaign is ready for your review.\n\nSubject line: \"Up to 40% off — February Clearance starts now\"\nAudience: All subscribers (2,847 contacts)\nScheduled: Feb 7, 2026 at 9:00 AM EST\n\nContent summary:\n- Hero banner with clearance messaging\n- 6 featured products (highest margin items)\n- Free shipping threshold: $50+\n- Urgency CTA: \"Sale ends Feb 14\"\n\nPredicted open rate: 24-28%\nPredicted click rate: 3.5-4.2%",
    time: "3h ago",
    unread: false,
  },
];

export function InboxView() {
  const theme = useContext(ThemeContext);
  const [selectedId, setSelectedId] = useState<string | null>(messages[0].id);

  const selected = messages.find((m) => m.id === selectedId);
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        fontFamily: theme.fontFamily,
        height: "100%",
      }}
    >
      {/* Left panel - message list */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: `1px solid ${theme.borderDim}`,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* List header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${theme.borderDim}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: theme.text,
                margin: 0,
              }}
            >
              Inbox
            </h2>
            {unreadCount > 0 && (
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
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedId(msg.id)}
              style={{
                padding: "14px 20px",
                cursor: "pointer",
                background: msg.id === selectedId ? "#f3f4f6" : "transparent",
                borderBottom: `1px solid ${theme.borderDim}`,
                transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => {
                if (msg.id !== selectedId) {
                  e.currentTarget.style.background = "#fafafa";
                }
              }}
              onMouseLeave={(e) => {
                if (msg.id !== selectedId) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {msg.unread && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: "#111827",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: msg.unread ? 600 : 500,
                      color: theme.text,
                    }}
                  >
                    {msg.sender}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                    flexShrink: 0,
                  }}
                >
                  {msg.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: msg.unread ? 600 : 400,
                  color: theme.text,
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.subject}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: theme.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.preview}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - message detail */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {selected ? (
          <>
            {/* Detail header */}
            <div
              style={{
                padding: "20px 28px 16px",
                borderBottom: `1px solid ${theme.borderDim}`,
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.text,
                  margin: "0 0 8px",
                }}
              >
                {selected.subject}
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.textMuted,
                  }}
                >
                  From: {selected.sender}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: theme.textDim,
                  }}
                >
                  {selected.time}
                </span>
              </div>
            </div>

            {/* Detail body */}
            <div
              style={{
                flex: 1,
                padding: "20px 28px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: theme.text,
                  whiteSpace: "pre-line",
                }}
              >
                {selected.body}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: theme.textDim,
              }}
            >
              Select a message
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
