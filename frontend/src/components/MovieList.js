import React, { useState, useEffect, useCallback } from 'react';
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
  const moviesPerPage = 10;

  const getAuthToken = () => localStorage.getItem('token');

  const setAuthHeader = useCallback(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Fetch movies or favorite movies based on search term and state
  useEffect(() => {
    setAuthHeader(); 

    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/movies${searchTerm && searchBy === 'genre' ? '/genre' : searchTerm && searchBy === 'title' ? '/title' : ''}`, {
          params: {
            page: currentPage,
            limit: moviesPerPage,
            ...(searchTerm && searchBy === 'genre' && { genre: searchTerm }),
            ...(searchTerm && searchBy === 'title' && { title: searchTerm })
          }
        });

        setMovies(response.data.movies);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    const fetchFavoriteMovies = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/favorites${searchTerm && searchBy === 'genre' ? '/genre' : searchTerm && searchBy === 'title' ? '/title' : ''}`, {
          params: {
            page: currentPage,
            limit: moviesPerPage,
            ...(searchTerm && searchBy === 'genre' && { genre: searchTerm }),
            ...(searchTerm && searchBy === 'title' && { title: searchTerm })
          }
        });

        setFavoriteMovies(response.data.movies || response.data); // Adjust response handling if needed
        setTotalPages(response.data.totalPages); // Assuming your API returns totalPages
      } catch (error) {
        console.error('Error fetching favorite movies:', error);
      }
    };

    if (showFavorites) {
      fetchFavoriteMovies();
    } else {
      fetchMovies();
    }
  }, [setAuthHeader, currentPage, showFavorites, searchTerm, searchBy]);

  const movieList = showFavorites ? favoriteMovies : movies;

  // Sorting
  const sortedMovies = [...movieList].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'release_year') {
      return b.release_year - a.release_year;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Pagination
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
        {sortedMovies.map(movie => (
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
