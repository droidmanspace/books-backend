const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = 'adWdWADrgvrsadDWgfvweDSCfrfvweascdrtg';

const EXPIRES_IN = 60 * 60 * 24;

let users = [];

const isValid = (username) => { //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {

  if (!isValid(username)) return false;

  const getPasswordByUsername = (username) => {
    const user = users.find(user => user.username === username);
    return user ? user.password : null;
  };

  return comparePassword(password, getPasswordByUsername(username));
}



function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

//only registered users can login
regd_users.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (!authenticatedUser(username, password))
    return res.status(401).json({
      message: "Invalid credentials"
    });


  const userId = users.findIndex(user => user.username === username);

  if (userId === -1) return res.status(401).json({
    error: 'Invalid User'
  });

  const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: EXPIRES_IN });

  req.session.authorization = token;
  return res.json({ message: 'Login successful', token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
