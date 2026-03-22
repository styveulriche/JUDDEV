const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage — aucun fichier écrit sur le disque
const memoryStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Seuls les fichiers image sont acceptés (jpg, png, webp, gif)'));
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    return cb(null, true);
  }
  cb(new Error('Seuls les fichiers PDF sont acceptés'));
};

exports.uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

exports.uploadPDF = multer({
  storage: memoryStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

exports.uploadMixed = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Upload un buffer vers Cloudinary — retourne l'URL sécurisée
exports.uploadToCloudinary = (file, folder = 'juddev') => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};
