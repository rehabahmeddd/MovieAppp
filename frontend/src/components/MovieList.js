import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import SearchBar from './SearchBar';
import '../App.css'; 

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false); 
  const [sortBy, setSortBy] = useState('title'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title'); 

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [moviesPerPage, setMoviesPerPage] = useState(10);
  const moviesPerPage= 10;


  const getAuthToken = () => localStorage.getItem('token');

 
  const setAuthHeader = React.useCallback(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []); 

 //fetch all movies
  useEffect(() => {
    setAuthHeader(); 

    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/movies', {
          params: {
            page: currentPage,
            limit: moviesPerPage
          }
        });
        setMovies(response.data.movies);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [setAuthHeader, currentPage, moviesPerPage]);

//fetch fav movies
  useEffect(() => {
    setAuthHeader(); 

    const fetchFavoriteMovies = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/favorites');
        setFavoriteMovies(response.data);
      } catch (error) {
        console.error('Error fetching favorite movies:', error);
      }
    };

    fetchFavoriteMovies();
  }, [setAuthHeader, showFavorites]);

 
  const movieList = showFavorites ? favoriteMovies : movies;

 //sorting
  const sortedMovies = [...movieList].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'release_year') {
      return b.release_year - a.release_year;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  //filtering
  const filteredMovies = sortedMovies.filter(movie => {
    if (searchBy === 'title') {
      return movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'genre') {
      return movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

 //pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <SearchBar setSearchTerm={setSearchTerm} setSearchBy={setSearchBy} />
      <div className="sorting-bar">
        <label className="sorting-label">Sort by:</label>
        <select
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
          className="sorting-select"
        >
          <option value="title">Title</option>
          <option value="release_year">Release Year</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="toggle-favorites">
        <button onClick={() => setShowFavorites(!showFavorites)} className="toggle-button">
          {showFavorites ? 'Show All Movies' : 'Show Favorites'}
        </button>
      </div>
      <div className="movie-list">
        {filteredMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default MovieList;
