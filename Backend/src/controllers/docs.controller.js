//This file reads input, calls service, returns response for documentation-related operations
// It acts as a bridge between the routes and the services, ensuring a clean separation of concerns.
import { createDocument as createDocumentService, listUserDocuments as listUserDocumentsService, openDocument as openDocumentService, renameDocument as renameDocumentService } from '../services/docs.services.js';

export const createDocument = async (req, res) => {
  return createDocumentService(req, res);
};

export const listUserDocuments = async (req, res) => {
  return listUserDocumentsService(req, res);
};

export const openDocument = async (req, res) => {
  return openDocumentService(req, res);
};  

export const renameDocument = async (req, res) => {
  return renameDocumentService(req, res);
};


