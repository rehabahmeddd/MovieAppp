const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const mysql = require('mysql2');

// Database Connection 
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: "3306"
});


// Open the MYSQL connection
connection.connect(error=>{
  if(error){console.log("An occurred during connection");
    throw error;
  }
});




// Middleware to enable CORS
app.use(cors({
    origin: 'http://localhost:3001', // client-side port
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// user data 
const users = [
    {
        id: 1,
        username: 'user1',
        password: bcrypt.hashSync('password1', 10)
    },
    {
        id: 2,
        username: 'user2',
        password: bcrypt.hashSync('password2', 10)
    }
];



// middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

//get all movies endpoint
app.get('/api/movies', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
      return res.status(400).send('Invalid pagination parameters');
  }

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Query to get movies with pagination
  connection.query(
      `SELECT * FROM movies LIMIT ?, ?`,
      [startIndex, pageSize],
      (err, rows) => {
          if (err) {
              console.log('Error while getting movies from database.');
              return res.status(500).send('Error while fetching movies');
          }

          // Get the total count of movies
          connection.query('SELECT COUNT(*) AS total FROM movies', (countErr, countRows) => {
              if (countErr) {
                  console.log('Error while getting total movies count.');
                  return res.status(500).send('Error while fetching movies count');
              }

              const totalMovies = countRows[0].total;

              res.json({
                  page: pageNumber,
                  limit: pageSize,
                  totalMovies,
                  totalPages: Math.ceil(totalMovies / pageSize),
                  movies: rows
              });
          });
      }
  );
});

// get a movie by ID endpoint
app.get('/api/movies/:id', (req, res) => {
  const movieId = parseInt(req.params.id);
  connection.query(
      'SELECT * FROM movies WHERE id = ?',
      [movieId],
      (err, results) => {
          if (err) {
              console.log('Error while getting movie from database.');
              return res.status(500).send('Error while fetching movie');
          }

          if (results.length === 0) return res.status(404).send('Movie not found');

          res.json(results[0]);
      }
  );
});




// get favorite movies
app.get('/api/favorites', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  connection.query(
      `SELECT * FROM movies m
      INNER JOIN favs f ON m.id = f.movie_id
      WHERE f.user_id = ?`,
      [userId],
      (err, rows) => {
          if (err) {
              console.log('Error while getting favorite movies from database.');
              return res.status(500).send('Error while fetching favorite movies');
          }

          res.json(rows);
      }
  );
});

//  add a movie to favorites
app.post('/api/favorites', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    const { movieId } = req.body;

    if (typeof movieId !== 'number' && isNaN(Number(movieId))) {
        return res.status(400).send('Movie ID must be a valid number');
    }

    const numericMovieId = Number(movieId);

        connection.query(
          `SELECT * FROM favs WHERE user_id = ? AND movie_id = ?`,
          [userId, movieId],
          (err, results) => {
              if (err) {
                  console.log('Error while checking if movie is already in favorites.');
                  return res.status(500).send('Error while checking favorite movies');
              }
  
              if (results.length > 0) {
                  return res.status(400).send('Movie already in favorites');
              }
  
              // Add the movie to favorites
              connection.query(
                  `INSERT INTO favs (user_id, movie_id) VALUES (?, ?)`,
                  [userId, movieId],
                  (insertErr) => {
                      if (insertErr) {
                          console.log('Error while adding movie to favorites.');
                          return res.status(500).send('Error while adding movie to favorites');
                      }
  
                      res.status(201).send('Movie added to favorites');
                  }
              );
          }
      );
  });
  

// remove a movie from favorites
app.delete('/api/favorites/:id', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const movieId = parseInt(req.params.id, 10);
    connection.query(
      `DELETE FROM favs WHERE user_id = ? AND movie_id = ?`,
      [userId, movieId],
      (err, result) => {
          if (err) {
              console.log('Error while removing movie from favorites.');
              return res.status(500).send('Error while removing movie from favorites');
          }

          if (result.affectedRows === 0) {
              return res.status(404).send('Favorite movie not found');
          }

          res.status(200).send('Movie removed from favorites');
      }
  );
});

// login
app.post('/api/login', (req, res) => {
    console.log("logging");
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    console.log(user);
    if (user == null) {
        console.log('User not found');
        return res.status(400).send('Cannot find user');
    }

    if (bcrypt.compareSync(password, user.password)) {
        const accessToken = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET);
        console.log('Login successful');
        res.json({ accessToken });
    } else {
        console.log('Invalid password');
        res.status(403).send('Invalid credentials');
    }
});

// Start the serverr
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} and Databas is connected`);
});
