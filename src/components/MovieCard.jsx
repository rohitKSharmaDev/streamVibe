import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language, id } }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie-details?id=${id}`)}
      className="movie-card cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden bg-gray-900"
    >
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={`Poster of movie ${title}`}
        className="w-full h-[340px] object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{title}</h3>

        <div className="flex items-center space-x-2 text-gray-400 text-sm mt-2">
          <div className="flex items-center space-x-1">
            <img src="star.svg" alt="Star Icon" className="w-4 h-4" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="uppercase">{original_language}</p>

          <span>•</span>
          <p>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
