import DocCard from "./DocCard.jsx";

export default function DocList({ documents = [], onOpen }) {
  if (!documents.length) {
    return <p>No documents yet.</p>;
  }

  return (
    <ul>
      {documents.map((doc) => (
        <li key={doc.id} style={{ marginBottom: 8 }}>
          <DocCard doc={doc} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}
