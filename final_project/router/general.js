const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password required" });
  }

  // Check if username already exists
  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const allBooks = await books
  res.send(allBooks)
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const id = await req.params.isbn
  const book = await books[id]
  Promise(res.send(book))
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const { author } = await req.params;
  const booksByAuthor = await Object.values(books).filter(
    (b) => b.author.toLowerCase() === author.toLowerCase()
  );

  if (booksByAuthor.length > 0) {
    Promise(res.json(booksByAuthor));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const { title } = await req.params;
  const booksByTitle = await Object.values(books).filter(
    (b) => b.title.toLowerCase() === title.toLowerCase()
  );

  if (booksByTitle.length > 0) {
    Promise(res.json(booksByTitle));
  } else {
    res.status(404).json({ message: "No books found for this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews || [];
    res.json(reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
