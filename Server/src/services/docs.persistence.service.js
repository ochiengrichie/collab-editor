import db from "../db/index.js";

export async function getLatestDocState(documentId) {
  const result = await db.query(
    `SELECT COALESCE(content, '') AS content, version FROM document_snapshots WHERE document_id = $1 ORDER BY version DESC LIMIT 1`,
    [documentId]
  );

  if (result.rows.length === 0) {
    return { content: "", version: 0 };
  }

  return {
    content: result.rows[0].content,
    version: Number(result.rows[0].version),
  };
}

export async function appendSnapshot(documentId, content, userId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Lock latest version row so two saves don't create same next version
    const latest = await client.query(
      `SELECT version FROM document_snapshots WHERE document_id = $1 ORDER BY version DESC LIMIT 1 FOR UPDATE`,
      [documentId]
    );

    const currentVersion = latest.rows.length > 0 ? Number(latest.rows[0].version) : 0;
    const nextVersion = currentVersion + 1;

    const inserted = await client.query(
      `INSERT INTO document_snapshots (document_id, content, version) VALUES ($1, $2, $3) 
      RETURNING content, version`,
      [documentId, content, nextVersion]
    );

    // Update the document row's timestamp + version so the document's metadata reflects the latest change
    await client.query(
      `UPDATE documents SET updated_at = NOW(), current_version = $1 WHERE id = $2`,
      [nextVersion, documentId]
    );

    await client.query("COMMIT");
    return inserted.rows[0];
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Error during rollback:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}
