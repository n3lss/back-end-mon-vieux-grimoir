const multer = require('multer');
const sharp = require('sharp');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new Error('Format de fichier non pris en charge'), false);
    }
  }
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      
      return res.status(400).json({ error: err.message });
    } else if (err) {
      
      return res.status(400).json({ error: err.message });
    }
    const buffer = req.file.buffer;
    const newFilesName = Date.now();
    sharp(buffer)
      .resize( 206 ) 
      .jpeg({ quality: 70 }) 
      .toFile(`images/${newFilesName}.jpg`, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
        }
        req.file.filename = `${newFilesName}.jpg`
        next(); 
      });
  });
};
