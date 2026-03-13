export default function DocCard({ doc, onOpen }) {
  if (!doc) return null;

  return (
    <div className="doc-card">
      <div className="doc-card-content">
        <div className="doc-card-title">{doc.title || "Untitled"}</div>
        <div className="doc-card-meta">
          {doc.owner_id ? `Owner: ${doc.owner_id}` : "No owner info"}
        </div>
      </div>
      <button className="doc-card-button" onClick={() => onOpen?.(doc)}>
        Open
      </button>
    </div>
  );
}
