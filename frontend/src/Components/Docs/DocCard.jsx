export default function DocCard({ doc, onOpen }) {
  if (!doc) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{doc.title || "Untitled"}</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {doc.owner_id ? `Owner: ${doc.owner_id}` : "No owner info"}
        </div>
      </div>
      <button onClick={() => onOpen?.(doc)}>Open</button>
    </div>
  );
}
