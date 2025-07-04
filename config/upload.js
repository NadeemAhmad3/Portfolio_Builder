// backend/config/upload.js
import multer from 'multer';
import path from 'path';

// Set up storage engine for Multer
const storage = multer.diskStorage({
  // destination: where to store the file
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The 'uploads' folder
  },
  // filename: what to name the file
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwriting files with the same name
    // fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type to allow only images
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Set a file size limit (e.g., 2MB)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image'); // 'image' must match the key name from the frontend FormData

export default upload;
