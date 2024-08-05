const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const bcrypt = require('bcryptjs');

function hashPassword(password) {
  return bcrypt.hashSync(password, 8);
}

public_users.post("/register", (req, res) => {

  const { username, password } = req.body;

  if (!password || !username) return res.status(400).json({
    error: 'username/password not provided.'
  })

  const hashedPassword = hashPassword(password);
  const newUser = {
    username,
    password: hashedPassword
  }
  users.push(newUser);

  return res.status(300).json({
    message: "Customer successfully registered.Now you can login"
  });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {

  const getBooks = () => {
    return new Promise((resolve, reject) => {
      if (!books) return reject('No books');
      return resolve(books)
    });
  }

  try {
    const allBooks = await getBooks();
    return res.status(200).json({
      books: allBooks
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

  const { isbn } = req.params;
  const getBooksByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      let book = books[isbn]
      if (book === undefined) return reject(new Error('No books found with isbn'));
      return resolve(book)
    });
  }

  getBooksByIsbn(isbn).then(book => res.status(300).json(book)).catch(e => res.status(400).json({
    error: e.message
  }))

});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {

  const author = req.params.author;

  const getBookByAuthor = (authorName) => {
    for (const key in books) {
      if (books[key].author === authorName) {
        return books[key];
      }
    }
    return null;
  }
  const book = getBookByAuthor(author);

  if (!book) return res.status(400).json({
    error: `No book found by author : ${author}`
  })

  return res.status(300).json({ bookbyauthor: [book] });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBookByTitle = (title) => {
    for (const key in books) {
      if (books[key].title === title) {
        return books[key];
      }
    }
    return null;
  }
  const book = getBookByTitle(title);

  if (!book) return res.status(400).json({
    error: `No book found by title: ${title}`
  })

  return res.status(300).json({ bookbytitle: [book] });

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  const getReviewsByIsbn = (isbn) => {
    if (books[isbn] === undefined) {
      return null;
    }
    return books[isbn].reviews;
  }

  const book = getReviewsByIsbn(isbn);

  return res.status(200).json(book);

});

module.exports.general = public_users;
