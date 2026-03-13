//In this file we will carry out DB queries + rules (membership checks) + response formatting for document members
// related operations
import db from '../db/index.js';
import { createResponse } from '../utils/response.js';

const ROLES = ['viewer', 'editor', 'owner'];


function ownerCheck(documentId, userId) {
    return db.query(
        'SELECT * FROM document_members WHERE document_id = $1 AND user_id = $2 AND role = $3',
        [documentId, userId, 'owner']
    );
}

// A) Invite member (owner only)
export const inviteMember = async (req, res) => {
  const client = await db.connect();

  const { email, role } = req.body;
  const documentId = req.params.id;
  const userId = req.user.id;
  
    if (!documentId || !email || !role) {
    return createResponse(res, false, null, 'Document ID, email, and role of the member are required', 400);
  }
    if (!ROLES.includes(role)) {
    return createResponse(res, false, null, 'Invalid role. Must be one of: viewer, editor, owner', 400);
  }
    try {

        await client.query('BEGIN');
    // Check if the requester is the owner of the document
    const ownerCheckResult = await ownerCheck(documentId, userId);
    if (ownerCheckResult.rows.length === 0) {
        return createResponse(res, false, null, 'Only owners can invite members', 403);
    }
    // Get the user ID of the invitee
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
        return createResponse(res, false, null, 'User with the provided email does not exist', 404);
    }
    const inviteeId = userResult.rows[0].id;
    // Check if the user is already a member
    const memberCheck = await client.query(
        'SELECT * FROM document_members WHERE document_id = $1 AND user_id = $2',
        [documentId, inviteeId]
    );
    if (memberCheck.rows.length > 0) {
        return createResponse(res, false, null, 'User is already a member of the document', 400);
    }
    // Add the user as a member
    await client.query(
        'INSERT INTO document_members (document_id, user_id, role) VALUES ($1, $2, $3)',
        [documentId, inviteeId, role]
    );
    await client.query('COMMIT');
    return createResponse(res, true, null, 'Member invited successfully', 201);
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
    console.error('Error inviting member:', error);
    return createResponse(res, false, null, 'Internal server error, Could not invite member', 500);
  }finally {
    client.release();
  }
};

// B) List members (any member can view)
export const listMembers = async (req, res) => {
  const documentId = req.params.id;
    const userId = req.user.id;
    const username = req.user.name;
    const client = await db.connect();
    try {  
    // Check if the requester is a member of the document
    await client.query('BEGIN');
    const memberCheck = await client.query(
        'SELECT  * FROM document_members WHERE document_id = $1 AND user_id = $2',
        [documentId, userId]
    );
    if (memberCheck.rows.length === 0) {
        return createResponse(res, false, null, 'Only members can view document members', 403);
    }
    // Retrieve members
    const members = await client.query(
        `SELECT u.id,u.name,u.email, dm.role FROM users u 
        JOIN document_members dm ON u.id = dm.user_id WHERE dm.document_id = $1`,
        [documentId]
    );
    await client.query('COMMIT');
    return createResponse(res, true, { members: members.rows }, null, 200);
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
    console.error('Error listing members:', error);
    return createResponse(res, false, null, 'Internal server error, Could not retrieve members', 500);
  } finally {
    client.release();
  };
};

// C) Update member role (owner only)
export const updateMemberRole = async (req, res) => {
  const documentId = req.params.id;
  const { memberId } = req.params;
  const { newRole } = req.body;
  const userId = req.user.id;
  const client = await db.connect();
    if (!memberId || !newRole) {
    return createResponse(res, false, null, 'Member ID and new role are required', 400);
  }
    if (!ROLES.includes(newRole)) {
    return createResponse(res, false, null, 'Invalid role. Must be one of: viewer, editor, owner', 400);
  }
    try {  
        await client.query('BEGIN');
    // Check if the requester is the owner of the document
    const ownerCheckResult = await ownerCheck(documentId, userId);
    if (ownerCheckResult.rows.length === 0) {
        return createResponse(res, false, null, 'Only owners can update member roles', 403);
    }
    //check to ensure at least one owner remains to prevent demoting last owner
    const roleCheck = await client.query(
        'SELECT role FROM document_members WHERE document_id = $1 AND user_id = $2',
        [documentId, memberId]
    );
    if (roleCheck.rows.length === 0) {
        return createResponse(res, false, null, 'Member not found in the document', 404);
    }
    const memberRole = roleCheck.rows[0].role;
    if (memberRole === 'owner' && newRole !== 'owner') {
        const ownerCountResult = await client.query(
            'SELECT COUNT(*) FROM document_members WHERE document_id = $1 AND role = $2',
            [documentId, 'owner']
        );
        const ownerCount = parseInt(ownerCountResult.rows[0].count, 10);
        if (ownerCount <= 1) {
            return createResponse(res, false, null, 'Cannot demote the last owner of the document', 400);
        }
    }
    // Update member role
    const updateResult = await client.query(
        'UPDATE document_members SET role = $1 WHERE document_id = $2 AND user_id = $3 RETURNING *',
        [newRole, documentId, memberId]
    );
    if (updateResult.rows.length === 0) {
        return createResponse(res, false, null, 'Member not found in the document', 404);
    }
    await client.query('COMMIT');
    return createResponse(res, true, null, 'Member role updated successfully', 200);
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
    console.error('Error updating member role:', error);
    return createResponse(res, false, null, 'Internal server error, Could not update member role', 500);
  } finally {
    client.release();
  };
};

// D) Remove member (owner only)
export const removeMember = async (req, res) => {
  const documentId = req.params.id;
    const { memberId } = req.params;
    const userId = req.user.id;
    const client = await db.connect();
    if (!memberId) {
    return createResponse(res, false, null, 'Member ID is required', 400);
  }
    try {  
        await client.query('BEGIN');
    // Check if the requester is the owner of the document
    const ownerCheckResult = await ownerCheck(documentId, userId);
    if (ownerCheckResult.rows.length === 0) {
        return createResponse(res, false, null, 'Only owners can remove members', 403);
    }
    //check to ensure at least one owner remains
    const roleCheck = await client.query(
        'SELECT role FROM document_members WHERE document_id = $1 AND user_id = $2',
        [documentId, memberId]
    );
    if (roleCheck.rows.length === 0) {
        return createResponse(res, false, null, 'Member not found in the document', 404);
    }
    const memberRole = roleCheck.rows[0].role;
    if (memberRole === 'owner') {
        const ownerCountResult = await client.query(
            'SELECT COUNT(*) FROM document_members WHERE document_id = $1 AND role = $2',
            [documentId, 'owner']
        );
        const ownerCount = parseInt(ownerCountResult.rows[0].count, 10);
        if (ownerCount <= 1) {
            return createResponse(res, false, null, 'Cannot remove the last owner of the document', 400);
        }
    }
    // Remove member
    const deleteResult = await client.query(
        'DELETE FROM document_members WHERE document_id = $1 AND user_id = $2 RETURNING *',
        [documentId, memberId]
    );
    if (deleteResult.rows.length === 0) {
        return createResponse(res, false, null, 'Member not found in the document', 404);
    }
    await client.query('COMMIT');
    return createResponse(res, true, null, 'Member removed successfully', 200);
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
    console.error('Error removing member:', error);
    return createResponse(res, false, null, 'Internal server error, Could not remove member', 500);
  } finally {
    client.release();
  };
};
