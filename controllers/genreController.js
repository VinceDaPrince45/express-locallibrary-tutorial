const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find({}).sort({name:1}).exec();
  res.render("layout",{
    title:"Genre List",
    genre_list:allGenres
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}, "title summary").exec()
  ]);

  if (genre == null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout",{
    title: "Genre Detail",
    genre:genre,
    genre_books:booksInGenre
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("layout",{
    title:"Create Genre",
    genre: null,
    errors: null,
  });
};

// // Handle Genre create on POST.
exports.genre_create_post = [
  body("name","Genre name must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),
  
  asyncHandler(async (req,res,next) => {
    const errors = validationResult(req);
    const genre = new Genre({name:req.body.name});
    if (!errors.isEmpty()) {
      res.render("layout",{
        title:"Create Genre",
        genre:genre,
        errors: errors.array()
      });
      return;
    } else {
      const genreExists = await Genre.findOne({name:req.body.name})
        .collation({locale:"en",strength:2})
        .exec()
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id}).populate("author").exec()
  ]);

  if (genre === null) {
    res.redirect("/catalog/genres");
  }

  res.render("layout", {
    title:"Delete Genre",
    genre:genre,
    genre_books:allBooksByGenre
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id}).populate("author").exec()
  ]);
  
  if (allBooksByGenre.length > 0) {
    res.render("layout", {
      title:"Delete Genre",
      genre:genre,
      genre_books:allBooksByGenre
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.genre_id);
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec()
  res.render("layout",{
    title:"Update Genre",
    genre: genre,
    errors: null,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name","Genre name must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),
  
  asyncHandler(async (req,res,next) => {
    const errors = validationResult(req);
    const genre = new Genre({name:req.body.name,_id:req.params.id});
    if (!errors.isEmpty()) {
      res.render("layout",{
        title:"Update Genre",
        genre:genre,
        errors: errors.array()
      });
      return;
    } else {
      const genreExists = await Genre.findOne({name:req.body.name})
        .collation({locale:"en",strength:2})
        .exec()
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id,genre,{})
        res.redirect(updatedGenre.url);
      }
    }
  })
];
