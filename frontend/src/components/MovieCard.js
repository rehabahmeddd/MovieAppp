import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => (
  <div className="movie-card">
    <Link to={`/movies/${movie.id}`} className="movie-card-link">
      <img src={movie.poster} alt={movie.title} className="movie-poster" />
      <div className="movie-overlay">
        <div className="movie-info">
          <h2>{movie.title}</h2>
          <p className="movie-genre">{movie.genre}</p>
          <p className="movie-release-date">{movie.release_year}</p>
          <p className="movie-rating">{movie.rating}</p>
        </div>
      </div>
    </Link>
  </div>
);

export default MovieCard;
