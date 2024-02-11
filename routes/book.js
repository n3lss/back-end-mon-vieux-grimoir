const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multerConfig = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.bestRating)
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multerConfig, bookCtrl.createBook);
router.put('/:id', auth, multerConfig, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.newRatingBook)

module.exports = router;