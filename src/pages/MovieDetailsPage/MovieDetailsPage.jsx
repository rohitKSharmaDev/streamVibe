import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../../utils/constants';

const MovieDetailsPage = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('id');

  const [movieData, setMovieData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  const fetchMovieDetails = async (id) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [detailsRes, videosRes, creditsRes, similarRes] = await Promise.all([
        fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${id}/credits`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${id}/similar`, API_OPTIONS),
      ]);

      if (!detailsRes.ok) throw new Error('Failed to fetch details');

      const details = await detailsRes.json();
      const vids = videosRes.ok ? await videosRes.json() : { results: [] };
      const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };
      const similarMovies = similarRes.ok ? await similarRes.json() : { results: [] };

      setMovieData(details);
      setVideos(vids.results);
      setCast(credits.cast || []);
      setSimilar(similarMovies.results || []);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setErrorMsg('Failed to fetch movie details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) fetchMovieDetails(movieId);
  }, [movieId]);

  if (isLoading) return <div className="text-center py-20 text-gray-300">Loading...</div>;
  if (errorMsg) return <div className="text-center py-20 text-red-500">{errorMsg}</div>;
  if (!movieId || !movieData) return <div className="text-center py-20 text-gray-300">No movie selected.</div>;

  const backdrop = movieData.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : null;
  const poster = movieData.poster_path ? `https://image.tmdb.org/t/p/w342${movieData.poster_path}` : null;
  const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  const formatRuntime = (m) => {
    if (!m && m !== 0) return '—';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${mm}m`;
  };

  const formatMoney = (n) => (n ? `$${n.toLocaleString()}` : '—');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Hero Section with Parallax */}
      <div className="relative overflow-hidden">
        <div
          className="h-[65vh] md:h-[72vh] w-full bg-center bg-cover transform will-change-transform"
          style={{
            backgroundImage: backdrop ? `url(${backdrop})` : 'linear-gradient(90deg,#111827,#0f172a)',
            backgroundAttachment: 'fixed', // Parallax
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-16 h-full flex items-center">
            <div className="flex w-full gap-8 md:gap-12 items-start">
              <div
                className="shrink-0 mt-6 md:mt-0 transition-transform hover:scale-105"
              >
                <div className="w-36 md:w-56 rounded-2xl overflow-hidden shadow-2xl border border-black/40">
                  {poster ? (
                    <img src={poster} alt={movieData.title} className="w-full h-auto block" />
                  ) : (
                    <div className="w-full h-56 md:h-80 bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-500">No Poster</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-6 md:pt-0">
                <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-left">{movieData.title}</h1>
                {movieData.tagline && <p className="mt-1 text-sm md:text-base text-gray-300 italic">{movieData.tagline}</p>}

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-300">
                  <div>
                    <span className="font-medium text-gray-100">{movieData.release_date ? movieData.release_date.slice(0, 4) : '—'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatRuntime(movieData.runtime)}</span>
                    {movieData.genres?.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{movieData.genres.map((g) => g.name).join(', ')}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-3">
                    <div className="flex items-center bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="text-sm font-semibold">⭐ {movieData.vote_average?.toFixed(1) ?? '—'}</span>
                      <span className="ml-2 text-xs text-gray-300">/10</span>
                    </div>
                    <div className="text-xs text-gray-400">{movieData.vote_count ?? 0} votes</div>
                  </div>
                </div>

                {/* Genres as chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {movieData.genres?.map((g) => (
                    <span key={g.id} className="px-3 py-1 rounded-full bg-white/10 text-sm backdrop-blur-md border border-white/10">{g.name}</span>
                  ))}
                </div>

                <p className="mt-4 text-gray-200 max-w-3xl leading-relaxed">{movieData.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid with Glassmorphism */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 -mt-10 relative z-20">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm text-gray-300 font-semibold">Status</h3>
              <div className="text-gray-100">{movieData.status || '—'}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Release Date</h3>
              <div className="text-gray-100">{movieData.release_date || '—'}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Runtime</h3>
              <div className="text-gray-100">{formatRuntime(movieData.runtime)}</div>
            </div>

            <div>
              <h3 className="text-sm text-gray-300 font-semibold">Language</h3>
              <div className="text-gray-100">{movieData.spoken_languages?.map((l) => l.english_name).join(', ') || '—'}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Country</h3>
              <div className="text-gray-100">{movieData.production_countries?.map((c) => c.name).join(', ') || '—'}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Popularity</h3>
              <div className="text-gray-100">{movieData.popularity ?? '—'}</div>
            </div>

            <div>
              <h3 className="text-sm text-gray-300 font-semibold">Budget</h3>
              <div className="text-gray-100">{formatMoney(movieData.budget)}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Revenue</h3>
              <div className="text-gray-100">{formatMoney(movieData.revenue)}</div>

              <h3 className="mt-4 text-sm text-gray-300 font-semibold">Production</h3>
              <div className="text-gray-100">{movieData.production_companies?.map((p) => p.name).join(', ') || '—'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cast Carousel */}
      {cast.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 mt-12">
          <h2 className="text-xl font-bold mb-4">Top Cast</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {cast.slice(0, 10).map((actor) => (
              <div key={actor.cast_id} className="shrink-0 w-28 text-center">
                <img
                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/92x138'}
                  alt={actor.name}
                  className="w-28 h-36 object-cover rounded-lg shadow"
                />
                <p className="mt-2 text-sm font-medium">{actor.name}</p>
                <p className="text-xs text-gray-400">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies */}
      {similar.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 mt-12 pb-[100px]">
          <h2 className="text-xl font-bold mb-4">Similar Movies</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {similar.slice(0, 12).map((movie) => (
              <div key={movie.id} className="shrink-0 w-40">
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/120x180'}
                  alt={movie.title}
                  className="w-40 h-60 object-cover rounded-lg shadow"
                />
                <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-gray-700 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => trailer && setShowTrailer(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              ▶ Play Trailer
            </button>
          </div>
          <div className="hidden md:block text-gray-300 text-sm">
            {movieData?.title} ({new Date(movieData?.release_date).getFullYear()})
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              className="absolute -top-10 right-0 text-white text-2xl"
              onClick={() => setShowTrailer(false)}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;
