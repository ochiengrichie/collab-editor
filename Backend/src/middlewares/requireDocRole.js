import db from '../db/index.js';
import { createResponse } from '../utils/response.js';

const requireDocRole = (requiredRole) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const docId = req.params.id;
    try {
      const membershipResult = await db.query(
        'SELECT role FROM document_members WHERE document_id = $1 AND user_id = $2',    
        [docId, userId]
        );
        if (membershipResult.rows.length === 0) {
            return createResponse(res, false, null, 'Access denied: Not a member of the document', 403);
        }
        const userRole = membershipResult.rows[0].role;
        const rolesHierarchy = ['viewer', 'editor', 'owner'];
        if (rolesHierarchy.indexOf(userRole) < rolesHierarchy.indexOf(requiredRole)) {
            return createResponse(res, false, null, 'Access denied: Insufficient permissions', 403);
        }
        next();
    } catch (error) {   
        console.error('Error checking document role:', error);
        return createResponse(res, false, null, 'Internal server error while checking document role', 500);
    }
    };
};

export default requireDocRole;