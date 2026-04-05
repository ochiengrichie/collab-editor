import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db  from '../db/index.js';
import { createResponse } from '../utils/response.js';
import { OAuth2Client } from 'google-auth-library';


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 1000,
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
    // Basic input validation
    if (!name || !email || !password || password.length < 6 || !/\S+@\S+\.\S+/.test(email)) {
        return createResponse(res, false, null, 'Invalid email or password format', 400);
    }
    try {
    const existingUser = await db.query('SELECT * FROM collab_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return createResponse(res, false, null, 'Email already exists', 400);
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await db.query(
      'INSERT INTO collab_users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    const user = newUser.rows[0];

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, COOKIE_OPTIONS);
    return createResponse(res, true, { user }, null, 201);
    } catch (error) {
    console.error('Error registering user:', error);
    return createResponse(res, false, null, 'Internal server error, Registration failed', 500);
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // Basic input validation

    if (!email || !password) {
        return createResponse(res, false, null, 'Email and password are required', 400);
    }

    try {
    const userResult = await db.query('SELECT * FROM collab_users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return createResponse(res, false, null, 'Invalid email or password', 401);
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);    
    
    if (!passwordMatch) {
      return createResponse(res, false, null, 'Invalid email or password', 401);
    }
    
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, COOKIE_OPTIONS);
    return createResponse(res, true, { user: { id: user.id, name: user.name, email: user.email } }, null, 200);
    } catch (error) {
    console.error('Error logging in user:', error);
    return createResponse(res, false, null, 'Internal server error', 500);
  }
};

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return createResponse(res, false, null, 'Google token is required', 400);
  }
  try {
    const ticket = await client.verifyIdToken({idToken: token, audience: CLIENT_ID});
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const goodleSub = payload.sub; // Google's unique user ID for this user. You can use this to check if the user has previously logged in with Google.
    let userResult = await db.query('SELECT * FROM collab_users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    if (user){
      //Link google account if not linked before (optional)
      if (!user.google_sub) {
        await db.query('UPDATE collab_users SET google_id = $1 , auth_provider=$2 WHERE id = $3', [goodleSub, 'google', user.id]);
      }
    } else {
      // If user doesn't exist, create a new user with the Google email. You can also store google_sub for future reference.
      create = await db.query(
        'INSERT INTO collab_users (email, name, google_id, auth_provider) VALUES ($1, $2, $3, $4) RETURNING id, email',
        [email, name, goodleSub, 'google']
      );
      user = create.rows[0];
    }

    const jwtToken = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', jwtToken, COOKIE_OPTIONS);
    return createResponse(res, true, { user: { id: user.id, name: user.name, email: user.email } }, null, 200);
  }
  catch (error) {
    console.error('Error during Google login:', error);
    return createResponse(res, false, null, 'Google login failed', 500);
  }
};

