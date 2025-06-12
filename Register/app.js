require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,  'index.html'));
});

// Handle registration request
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      return res.send('Username already taken');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
      if (err) throw err;
      res.send('Registration successful!');
    });
  });
});


// Start the server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
3. Create Dockerfile for Login App
a. Create a Dockerfile using vi Dockerfile
b. Add the below given code in Dockerfile.

FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]
