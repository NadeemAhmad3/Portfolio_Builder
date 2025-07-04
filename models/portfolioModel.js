// backend/models/portfolioModel.js
import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  // Link the portfolio to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true, // Each user can only have one portfolio document
  },
  // Mirror the structure of your frontend state
  pageTitle: { type: String, default: '' },
  heroName: { type: String, default: '' },
  heroTitles: { type: [String], default: [] },
  heroImageURL: { type: String, default: '' },
  heroCV_URL: { type: String, default: '' },
  aboutImageURL: { type: String, default: '' },
  aboutHeading: { type: String, default: '' },
  aboutText: { type: String, default: '' },
  aboutDetails: { type: Array, default: [] }, // Flexible array for mixed content
  skillsData: { type: Array, default: [] },
  servicesData: { type: Array, default: [] },
  projectsData: { type: Array, default: [] },
  contactData: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;