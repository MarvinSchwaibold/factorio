"use client";

import { useContext } from "react";
import { Package, ShoppingCart, Users, Warehouse } from "lucide-react";
import { ThemeContext } from "@/lib/theme";

const domains = [
  {
    icon: <ShoppingCart size={20} />,
    label: "Orders",
    count: 128,
    description: "Recent transactions and fulfillment",
  },
  {
    icon: <Package size={20} />,
    label: "Products",
    count: 847,
    description: "Catalog, variants, and pricing",
  },
  {
    icon: <Users size={20} />,
    label: "Customers",
    count: "2.4k",
    description: "Profiles, segments, and B2B",
  },
  {
    icon: <Warehouse size={20} />,
    label: "Inventory",
    count: "3.1k",
    description: "Stock levels across locations",
  },
];

export function CommerceView() {
  const theme = useContext(ThemeContext);

  return (
    <div
      style={{
        flex: 1,
        padding: "32px 40px",
        background: "transparent",
        fontFamily: theme.fontFamily,
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.text,
            marginBottom: 4,
          }}
        >
          Commerce
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.textMuted,
            marginBottom: 32,
          }}
        >
          Browse and manage your commerce data
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {domains.map((domain) => (
            <div
              key={domain.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                background: theme.cardBg,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.background = theme.cardBgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.borderLight;
                e.currentTarget.style.background = theme.cardBg;
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  flexShrink: 0,
                }}
              >
                {domain.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: theme.text,
                    marginBottom: 2,
                  }}
                >
                  {domain.label}
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>
                  {domain.description}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: theme.textDim,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {domain.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
