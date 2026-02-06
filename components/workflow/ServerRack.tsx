"use client";

export function ServerRack() {
  return (
    <div style={{ border: "1px solid rgba(94, 234, 212, 0.15)", background: "rgba(94, 234, 212, 0.02)", display: "flex", flexDirection: "column", gap: 4, padding: 6, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 5, background: "rgba(94, 234, 212, 0.2)", width: "100%" }} />)}
    </div>
  );
}
