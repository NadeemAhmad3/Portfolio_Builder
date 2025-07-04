// backend/controllers/portfolioController.js
import Portfolio from '../models/portfolioModel.js';

// @desc    Get user's portfolio data
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  // req.user.id comes from the 'protect' middleware
  const portfolio = await Portfolio.findOne({ user: req.user.id });

  if (portfolio) {
    res.json(portfolio);
  } else {
    // If no portfolio exists, send back an empty object or default structure
    res.json({});
  }
};
// New function to get a portfolio by user ID for public viewing
const getPublicPortfolio = async (req, res) => {
  try {
    // Find the portfolio by the user's ID passed in the URL
    const portfolio = await Portfolio.findOne({ user: req.params.userId });

    if (portfolio) {
      res.json(portfolio);
    } else {
      res.status(404).json({ message: 'Portfolio not found' });
    }
  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Don't forget to export it

// @desc    Save/Update user's portfolio data
// @route   POST /api/portfolio
// @access  Private
const savePortfolio = async (req, res) => {
  const portfolioData = req.body;
  const userId = req.user.id;

  try {
    // findOneAndUpdate with upsert:true will create the doc if it doesn't exist
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { user: userId }, // find a document with this filter
      portfolioData,    // document to insert when `upsert: true`
      {
        new: true,         // return the new doc
        upsert: true,      // create the doc if it doesn't exist
        runValidators: true,
      }
    );
    res.status(200).json({
      message: 'Portfolio saved successfully!',
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    res.status(500).json({ message: 'Server error while saving portfolio.' });
  }
};
export { getPortfolio, savePortfolio, getPublicPortfolio };
