const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Import books data
const regd_users = express.Router();

let users = []; // Array to store registered users

// Function to check if the username is valid (exists in the users array)
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Function to authenticate user by username and password
const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username);
  return user ? user.password === password : false;
};

// Endpoint for user login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "your_jwt_secret", { expiresIn: "1h" });

  res.status(201).json({ message: "Login successful", token });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint to add a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const { username } = req.user;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Add or update review for the book
  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    res.status(201).json({ message: "Review added successfully" });
  } else {
    books[isbn].reviews[username] = review;
    res.status(200).json({ message: "Review updated successfully" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;