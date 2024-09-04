const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET_KEY;

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

// movie data
const movies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      release_year: 1994,
      genre: "Drama",
      rating: 9.3,
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      director: "Frank Darabont",
      actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"]
    },
    {
      id: 2,
      title: "The Godfather",
      release_year: 1972,
      genre: "Crime, Drama",
      rating: 9.2,
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@.V1_FMjpg_UX1000.jpg",
      director: "Francis Ford Coppola",
      actors: ["Marlon Brando", "Al Pacino", "James Caan"]
    },
    {
      id: 3,
      title: "The Dark Knight",
      release_year: 2008,
      genre: "Action, Crime, Drama",
      rating: 9.0,
      description: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@.V1.jpg",
      director: "Christopher Nolan",
      actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"]
    },
    {
      id: 4,
      title: "Inception",
      release_year: 2010,
      genre: "Action, Adventure, Sci-Fi",
      rating: 8.8,
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@.V1.jpg",
      director: "Christopher Nolan",
      actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
    },
    {
      id: 5,
      title: "Fight Club",
      release_year: 1999,
      genre: "Drama",
      rating: 8.8,
      description: "An insomniac office worker and a soap salesman build a global organization to help vent male aggression.",
      poster: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@.V1.jpg",
      director: "David Fincher",
      actors: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"]
    },
    {
      id: 6,
      title: "Pulp Fiction",
      release_year: 1994,
      genre: "Crime, Drama",
      rating: 8.9,
      description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@.V1.jpg",
      director: "Quentin Tarantino",
      actors: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"]
    },
    {
      id: 7,
      title: "The Lord of the Rings: The Return of the King",
      release_year: 2003,
      genre: "Action, Adventure, Drama",
      rating: 8.9,
      description: "Gandalf and Aragorn lead the world of men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
      poster: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@.V1.jpg",
      director: "Peter Jackson",
      actors: ["Elijah Wood", "Viggo Mortensen", "Orlando Bloom"]
    },
    {
      id: 8,
      title: "Forrest Gump",
      release_year: 1994,
      genre: "Drama, Romance",
      rating: 8.8,
      description: "The presidencies of Kennedy and Johnson, the events of Vietnam, the events of the civil rights movement, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
      poster: "https://m.media-amazon.com/images/S/pv-target-images/f9ddd832d1b566f5b8dd29a4dbc76b7531c420c8c8d9fdfe94eca128bda8e2b1.jpg",
      director: "Robert Zemeckis",
      actors: ["Tom Hanks", "Robin Wright", "Gary Sinise"]
    },
    {
      id: 9,
      title: "The Matrix",
      release_year: 1999,
      genre: "Action, Sci-Fi",
      rating: 8.7,
      description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@.V1.jpg",
      director: "Lana Wachowski, Lilly Wachowski",
      actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"]
    },
    {
      id: 10,
      title: "Gladiator",
      release_year: 2000,
      genre: "Action, Adventure, Drama",
      rating: 8.5,
      description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
      poster: "https://m.media-amazon.com/images/I/51GA6V6VE1L.AC_UF894,1000_QL80.jpg",
      director: "Ridley Scott",
      actors: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"]
    },
    {
      id: 11,
      title: "The Departed",
      release_year: 2006,
      genre: "Crime, Drama, Thriller",
      rating: 8.5,
      description: "An undercover cop and a mole in the police try to identify each other while infiltrating an Irish gang in Boston.",
      poster: "https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3.V1_FMjpg_UX1000.jpg",
      director: "Martin Scorsese",
      actors: ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"]
    },
    {
      id: 12,
      title: "Interstellar",
      release_year: 2014,
      genre: "Adventure, Drama, Sci-Fi",
      rating: 8.6,
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10543523_p_v8_as.jpg",
      director: "Christopher Nolan",
      actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
    },
    {
      id: 13,
      title: "The Lion King",
      release_year: 1994,
      genre: "Animation, Adventure, Drama",
      rating: 8.5,
      description: "Lion cub and future king Simba searches for his identity. His eagerness to please others and penchant for testing his boundaries sometimes gets him into trouble.",
      poster: "https://lumiere-a.akamaihd.net/v1/images/p_thelionking_19752_1_0b9de87b.jpeg",
      director: "Roger Allers, Rob Minkoff",
      actors: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones"]
    },
    {
      id: 14,
      title: "The Silence of the Lambs",
      release_year: 1991,
      genre: "Crime, Drama, Thriller",
      rating: 8.6,
      description: "A young FBI cadet must confide in an incarcerated and manipulative killer to receive his help on catching another serial killer who skins his victims.",
      poster: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@.V1.jpg",
      director: "Jonathan Demme",
      actors: ["Jodie Foster", "Anthony Hopkins", "Lawrence A. Bonney"]
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

// get all movies endpoint
app.get('/api/movies', (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);// ensure it's a no
    const pageSize = parseInt(limit, 10);
    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
        return res.status(400).send('Invalid pagination parameters');
    }

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedMovies = movies.slice(startIndex, endIndex); // paginate the movies list

    res.json({
        page: pageNumber,
        limit: pageSize,
        totalMovies: movies.length,
        totalPages: Math.ceil(movies.length / pageSize),
        movies: paginatedMovies
    });
});

// get a movie by ID endpoint
app.get('/api/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
});


let favoriteMovies = [];

// get favorite movies
app.get('/api/favorites', authenticateJWT, (req, res) => {
    res.json(favoriteMovies);
});

//  add a movie to favorites
app.post('/api/favorites', authenticateJWT, (req, res) => {
    const { movieId } = req.body;

    if (typeof movieId !== 'number' && isNaN(Number(movieId))) {
        return res.status(400).send('Movie ID must be a valid number');
    }

    const numericMovieId = Number(movieId);
    const movie = movies.find(m => m.id === numericMovieId);
    if (!movie) {
        console.error(`Movie with ID ${numericMovieId} not found`);
        return res.status(404).send('Movie not found');
    }

    if (!favoriteMovies.some(m => m.id === numericMovieId)) {
        favoriteMovies.push(movie);
        console.log('Favorite movie added:', movie);
        return res.status(201).json(movie);
    } else {
        return res.status(400).send('Movie already in favorites');
    }
});

// remove a movie from favorites
app.delete('/api/favorites/:id', authenticateJWT, (req, res) => {
    const movieId = parseInt(req.params.id);
    favoriteMovies = favoriteMovies.filter(m => m.id !== movieId);
    res.status(200).send('Movie removed from favorites');
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
    console.log(`Server running on http://localhost:${PORT}`);
});
