// routes/authRoutes.js
import express from 'express';
import {
  signupUser,
  loginUser,
  githubLogin,
  githubCallback,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

// GitHub OAuth Routes
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

export default router;
