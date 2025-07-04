// backend/routes/uploadRoutes.js
import express from 'express';
import upload from '../config/upload.js'; // Import our multer config

const router = express.Router();

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private (or Public, depending on your needs. Let's make it protected)
router.post('/', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // An error occurred when uploading (e.g., file type not allowed, file size too large)
      return res.status(400).send({ message: err });
    }
    
    if (req.file === undefined) {
      // No file was selected
      return res.status(400).send({ message: 'Error: No File Selected!' });
    }
    
    // Everything went fine, send back the path to the file
    // The path should be what the frontend can use to access the file
    // We replace backslashes with forward slashes for URL compatibility
    const filePath = `/${req.file.path.replace(/\\/g, "/")}`;
    
    res.status(200).send({
      message: 'File uploaded successfully',
      url: filePath,
    });
  });
});

export default router;