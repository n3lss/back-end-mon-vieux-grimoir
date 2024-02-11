const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;

  const newRating = {
    userId: req.auth.userId,
    grade: bookObject.averageRating
  };
  
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    ratings: [newRating]
  });

  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }); })
    .catch(error => { res.status(400).json({ error }); });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(topRatedBooks => {
      res.status(200).json(topRatedBooks);
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};
 

exports.newRatingBook = (req, res, next) => {
  const newRating = {
    userId: req.auth.userId,
    grade: req.body.rating
  };
  Book.findOne({_id: req.params.id})
  .then(book => {
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    const existingRating = book.ratings.find(rating => rating.userId === req.auth.userId);
      if (existingRating) {
        return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre' });
      }
    book.ratings.push(newRating);
    const totalRatings = book.ratings.length;
    let sum = 0;
    for (const rating of book.ratings) {
      sum += rating.grade;
    }
    const averageRating = sum / totalRatings;
    book.averageRating = averageRating;
    return book.save();
  })
  .then(updatedBook => {
    res.status(200).json(updatedBook);
  })
  .catch(error => {
    res.status(500).json({ error });
  });
};

