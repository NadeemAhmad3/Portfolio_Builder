// controllers/authController.js
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import axios from 'axios';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Redirect to GitHub for authorization
// @route   GET /api/auth/github
// @access  Public
export const githubLogin = (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(githubAuthUrl);
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
// controllers/authController.js

// ... (keep all other imports and functions like signupUser, loginUser, etc.)

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: { Accept: 'application/json' },
    });
    const { access_token } = tokenResponse.data;

    // 2. Use access token to get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });
    
    // ✅ FIX #1: Destructure 'login' as a fallback for 'name'.
    const { id: githubId, name, login, email: githubEmail } = userResponse.data;
    
    // Fallback if primary email is not public
    let userEmail = githubEmail;
    if (!userEmail) {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${access_token}` },
        });
        const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
        if (primaryEmail) {
            userEmail = primaryEmail.email;
        } else {
            // It's possible to not get an email, handle this case gracefully.
            return res.redirect(`${process.env.CLIENT_URL}/auth?error=GitHubEmailNotVerified`);
        }
    }

    // 3. Find or create user in your DB
    let user = await User.findOne({ githubId });

    if (!user) {
      // If no user with this githubId, check if one exists with the same email
      user = await User.findOne({ email: userEmail });
      if (user) {
        // User exists, link their GitHub ID and potentially update their name
        user.githubId = githubId;
        // ✅ FIX #2: Update name if it's more complete from GitHub
        user.name = name || user.name; // Keep existing name if GitHub name is null
        await user.save();
      } else {
        // Create a new user
        user = await User.create({
          // ✅ FIX #3: Use 'login' as a fallback if 'name' is null.
          name: name || login, 
          email: userEmail,
          githubId,
          // Note: No password is set, which is correct for OAuth users.
          // You might want to add a field like `authMethod: 'github'`
        });
      }
    }
    
    // 4. Generate JWT and redirect back to the frontend
    const token = generateToken(user._id, user.name, user.email); // Pass more user info into the token
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);

  } catch (error) {
    console.error('GitHub auth error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth?error=GitHubAuthenticationFailed`);
  }
};