function getRelativeTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DocCard({ doc, onOpen }) {
  if (!doc) return null;

  const lastUpdated = getRelativeTime(doc.updated_at);

  return (
    <div className="doc-card">
      <div className="doc-card-content">
        <div className="doc-card-title">{doc.title || "Untitled"}</div>
        <div className="doc-card-meta">
          {doc.owner_id ? `Owner: ${doc.owner_id}` : "No owner info"}
          {lastUpdated ? (
            <span className="doc-card-updated">Updated: {lastUpdated}</span>
          ) : null}
        </div>
      </div>
      <button className="doc-card-button" onClick={() => onOpen?.(doc)}>
        Open
      </button>
    </div>
  );
}
