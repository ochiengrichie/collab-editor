//This middleware ensures that only the owner of a document can perform certain actions on it.
import db from '../db/index.js';
import { createResponse } from '../utils/response.js';

const requireDocOwner = async (req, res, next) => {
  const documentId = req.params.id || req.body.documentId;
  const userId = req.user.id;
    if (!documentId) {
    return createResponse(res, false, null, 'Document ID is required', 400);
  }
    try {  
    const ownerCheck = await db.query(
      'SELECT * FROM document_members WHERE document_id = $1 AND user_id = $2 AND role = $3',
        [documentId, userId, 'owner']
    );
    if (ownerCheck.rows.length === 0) {
      return createResponse(res, false, null, 'Only document owners can perform this action', 403);
    }
    next();
    } catch (error) {
    console.error('Error checking document owner:', error);
    return createResponse(res, false, null, 'Internal server error', 500);
  }
};

export default requireDocOwner;
