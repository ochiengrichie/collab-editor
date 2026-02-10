import express from 'express';
import {createDocument, listUserDocuments, openDocument,renameDocument } from '../controllers/docs.controller.js';
import authMiddleware from '../middlewares/auth.js';
import requireDocRole from '../middlewares/requireDocRole.js';

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);

// Create a new document
router.post('/', createDocument);
// List documents belonging to the authenticated user
router.get('/', listUserDocuments);
// Open a specific document by ID
router.get('/:id', openDocument);
// Rename a specific document by ID (requires 'editor' role)
router.patch('/:id', requireDocRole('editor'), renameDocument);

export default router;
