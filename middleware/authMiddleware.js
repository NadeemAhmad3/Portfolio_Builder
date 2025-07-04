// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        // If user associated with token is not found (e.g., deleted)
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Everything is good, proceed to the controller
    } catch (error) {
      console.error('Token verification failed:', error.message);
      // --- FIX HERE ---
      // Instead of throwing an error, send a JSON response.
      // The 'return' stops further execution.
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // --- FIX HERE ---
    // Instead of throwing an error, send a JSON response.
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };
