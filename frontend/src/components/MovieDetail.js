import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import '../App.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Fetch movie details
        const response = await axios.get(`http://localhost:3000/api/movies/${id}`);
        setMovie(response.data);

        // Check if the movie is already a favorite
        const favResponse = await axios.get(`http://localhost:3000/api/favorites/isFavorite`, {
          params: { movieId: id }
        });
        setIsFavorite(favResponse.data.isFavorite);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovie();
  }, [id]);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`http://localhost:3000/api/favorites/${id}`);
        setIsFavorite(false);
      } else {
        // Add to favorites
        await axios.post('http://localhost:3000/api/favorites', { movieId: id });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="movie-detail">
      <img src={movie.poster} alt={movie.title} className="movie-poster" />
      <div className="movie-info">
        <h1>{movie.title}</h1>
        <p><strong>Release Year:</strong> {movie.release_year}</p>
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Rating:</strong> {movie.rating}</p>
        <p><strong>Description:</strong> {movie.description}</p>
        <p><strong>Director:</strong> {movie.director}</p>
        <p><strong>Actors:</strong> {movie.actors}</p>
        <button 
          onClick={handleFavoriteToggle} 
          className={`favorite-button ${isFavorite ? 'favorite' : 'not-favorite'}`}
        >
          <i className="fas fa-star"></i>
          {isFavorite ? ' Remove from Favorites' : ' Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default MovieDetail;
