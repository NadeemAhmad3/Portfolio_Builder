// backend/routes/portfolioRoutes.js
import express from 'express';
import { getPortfolio, savePortfolio,getPublicPortfolio } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chain GET and POST requests to the same '/' route
// Both routes are protected by the 'protect' middleware
router.route('/')
  .get(protect, getPortfolio)
  .post(protect, savePortfolio);
  router.get('/public/:userId', getPublicPortfolio);

export default router;