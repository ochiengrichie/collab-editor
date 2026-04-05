//This file acts as a bridge between routes and services for authentication-related operations
// It receives HTTP requests, calls the appropriate service functions, and sends back responses.
// It ensures a clean separation of concerns between routing and business logic.
// This keeps the codebase organized and maintainable.
import { 
  registerUser as registerUserService, 
  loginUser as loginUserService,
  googleLogin as googleLoginService 
} from '../services/auth.services.js';

export const registerUser = async (req, res) => {
  return registerUserService(req, res);
};

export const loginUser = async (req, res) => {
  return loginUserService(req, res);
};

export const googleLogin = async (req, res) => {
  return googleLoginService(req, res);
};