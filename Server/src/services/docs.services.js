import db from '../db/index.js';
import { createResponse } from '../utils/response.js';

const DEFAULT_DOC_CONTENT = "";

export const createDocument = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;
  if (!title || title.trim() === '') {
    return createResponse(res, false, null, 'Title is required', 400);
  }
  
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const contentValue = typeof content === "string" ? content : DEFAULT_DOC_CONTENT;
    const newDoc = await client.query(
      `INSERT INTO documents (title, content, owner_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, title, content, owner_id, updated_at`,
      [title, contentValue, userId]
    );

    await client.query(
      'INSERT INTO document_members (document_id, user_id, role) VALUES ($1, $2, $3)',
      [newDoc.rows[0].id, userId, 'owner']
    );

    await client.query('COMMIT');
    return createResponse(res, true, { document: newDoc.rows[0] }, null, 201);
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
        console.error('Error creating document:', error);
        return createResponse(res, false, null, 'Internal server error, Document creation failed', 500);
  }finally {
    client.release();
  }
};

export const listUserDocuments = async (req, res) => {
  const userId = req.user.id;
    try {  
    const docs = await db.query(
      `SELECT d.id, d.title, COALESCE(d.content, '') AS content, d.owner_id, d.updated_at, dm.role FROM documents d 
       JOIN document_members dm ON d.id = dm.document_id 
       WHERE dm.user_id = $1`,
      [userId]
    );
    return createResponse(res, true, { documents: docs.rows }, null, 200);
    } catch (error) {
    console.error('Error listing documents:', error);
    return createResponse(res, false, null, 'Internal server error, Could not retrieve documents', 500);
  }
};

export const openDocument = async (req, res) => {
    const docId = req.params.id;
    const userId = req.user.id;
    try {   
    const doc = await db.query(
      `SELECT 
         d.id,
         d.title,
         COALESCE(s.content, '') AS content,
         COALESCE(s.version, 0) AS version,
         d.owner_id,
         d.updated_at
       FROM documents d
       JOIN document_members dm ON d.id = dm.document_id
       LEFT JOIN LATERAL (
         SELECT content, version
         FROM document_snapshots
         WHERE document_id = d.id
         ORDER BY version DESC
         LIMIT 1
       ) s ON true
       WHERE dm.user_id = $1 AND dm.document_id = $2`,
      [userId, docId]
    );
    if (doc.rows.length === 0) {
      return createResponse(res, false, null, 'Document not found or access denied', 404);
    }
    return createResponse(res, true, { document: doc.rows[0] }, null, 200);
    } catch (error) {
    console.error('Error opening document:', error);
    return createResponse(res, false, null, 'Internal server error, Could not open document', 500);
  }
};

export const renameDocument = async (req, res) => {
    const docId = req.params.id;
    const { newTitle } = req.body;
    const userId = req.user.id; 

    if (!newTitle || newTitle.trim() === '') {
      return createResponse(res, false, null, 'New title is required', 400);
    }

    try {  
    const updatedDoc = await db.query(
      `UPDATE documents SET title = $1, updated_at = NOW() WHERE id = $2 AND id IN (
       SELECT document_id FROM document_members WHERE user_id = $3
      ) RETURNING id, title, COALESCE(content, '') AS content, owner_id, updated_at`,
        [newTitle, docId, userId]
    );
    if (updatedDoc.rows.length === 0) {
      return createResponse(res, false, null, 'Document not found or access denied', 404);
    }
    return createResponse(res, true, { document: updatedDoc.rows[0] }, null, 200);
    } catch (error) {
    console.error('Error renaming document:', error);
    return createResponse(res, false, null, 'Internal server error, Could not rename document', 500);
  }
};
