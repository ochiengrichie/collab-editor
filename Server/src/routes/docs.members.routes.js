//In this file we will have all the routes related to document members operations
import express from 'express';
import { inviteMember, listMembers, updateMemberRole, removeMember } from '../controllers/docs.members.controllers.js';
import authMiddleware from '../middlewares/auth.js';
import requireDocOwner from '../middlewares/requireDocOwner.js';
import validateRequest from '../middlewares/validateRequest.js';
import { docsSchemas } from '../validators/apiSchemas.js';

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);
// Invite a new member to a document (owner only)
router.post('/:id/invite', validateRequest(docsSchemas.inviteMember), requireDocOwner, inviteMember);
// List members of a document (any member can view)
router.get('/:id/members', validateRequest(docsSchemas.listMembers), listMembers);
// Update a member's role in a document (owner only)
router.patch('/:id/members/:memberId', validateRequest(docsSchemas.updateMemberRole), requireDocOwner, updateMemberRole);
// Remove a member from a document (owner only)
router.delete('/:id/members/:memberId', validateRequest(docsSchemas.removeMember), requireDocOwner, removeMember);

export default router;
