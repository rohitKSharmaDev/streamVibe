import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import './App.css';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API__OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [trendingErrorMsg, setTrendingErrorMsg] = useState('');

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMsg('');

    try { 
      const endpoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularitu.desc`;

      const response = await fetch(endpoint, API__OPTIONS);

      if(!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      
      if(data.Response === 'False') {
        setErrorMsg(data.Error ?? "Failed to fetch movies");
        setMoviesList([]);
        return;
      } 

      setMoviesList(data.results || []);
      
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error("Error fetching movies:", error);
    
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    setIsTrendingLoading(true);
    setTrendingErrorMsg('');

    try {
      const trendingMovRes = await getTrendingMovies();

      if(!trendingMovRes.length) {
        setTrendingErrorMsg("No trending movies found");
        return;
      }

      setTrendingMovies(trendingMovRes || []);
    
    } catch (error) {
      console.error("Error loading trending movies:", error);
    
    } finally { 
      setIsTrendingLoading(false);
    }
  };

  // const handleMovieCardClick = (movie) => {
    
  // };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }
  , [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <div className='flex flex-col items-center gap-x-3'>
            <img src="./movies-app.png" alt="StreamVibe Logo" className='logo' />
            <h5 className='text-gray-50 text-2xl'>StreamVibe</h5>
          </div>

          <img src="./hero-img.png" alt="Hero Image" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy WIthout the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className='trending'>
          <h2>Trending Searches</h2>
          {
            isTrendingLoading ? (
              <Spinner />
              ):
              trendingErrorMsg ? (
                <p className='text-red-500'>{trendingErrorMsg}</p>
              
              ):(
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index+1}</p>
                    <img 
                      src={movie.poster_url} 
                      alt={`Poster of movie ${movie.title}`}
                    />
                  </li>
                ))}
              </ul>
            )
          }
        </section>

        <section className='all-movies mt-[60px]'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          
          ) : errorMsg ? (
            <p className='text-red-500'>{errorMsg}</p>
          
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

          {errorMsg && <p className='text-red-500'>{errorMsg}</p>}
        </section>
      </div>
    </main>
  );
}

export default App;
