"use client";

export function ServerRack() {
  return (
    <div style={{ border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", flexDirection: "column", gap: 4, padding: 6, justifyContent: "center", borderRadius: 6 }}>
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 5, background: "#e5e7eb", width: "100%", borderRadius: 2 }} />)}
    </div>
  );
}
