import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

function Icon({ children, filled = false }) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {children}
    </span>
  );
}

function Navbar() {
  return (
    <header className="navbar">
      <NavLink className="brand" to="/">
        <Icon filled>play_arrow</Icon> StreamList
      </NavLink>

      <nav aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
}

function StreamList() {
  const [title, setTitle] = useState('');
const [movies, setMovies] = useState(() => {
  try {
    const savedMovies = localStorage.getItem('streamListMovies');
    return savedMovies ? JSON.parse(savedMovies) : [];
  } catch {
    return [];
  }
});
const [editingId, setEditingId] = useState(null);
const [message, setMessage] = useState('');

useEffect(() => {
  localStorage.setItem('streamListMovies', JSON.stringify(movies));
}, [movies]);
  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setMessage('Please enter a movie or show title.');
      return;
    }

    if (editingId !== null) {
      setMovies((current) =>
        current.map((movie) =>
          movie.id === editingId ? { ...movie, title: cleanTitle } : movie
        )
      );
      setMessage('Your title was updated!');
      setEditingId(null);
    } else {
      setMovies((current) => [
        ...current,
        { id: Date.now(), title: cleanTitle, completed: false },
      ]);
      setMessage('Added to your StreamList!');
    }

    setTitle('');
  }

  function editMovie(movie) {
    setTitle(movie.title);
    setEditingId(movie.id);
    setMessage('Edit the title and submit to save.');
  }

  function cancelEdit() {
    setTitle('');
    setEditingId(null);
    setMessage('');
  }

  function deleteMovie(id) {
    setMovies((current) => current.filter((movie) => movie.id !== id));

    if (editingId === id) {
      cancelEdit();
    } else {
      setMessage('Title deleted.');
    }
  }

  function toggleComplete(id) {
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id ? { ...movie, completed: !movie.completed } : movie
      )
    );
  }

  return (
    <main className="page-content">
      <section className="hero">
        <p className="eyebrow">YOUR PERSONAL WATCHLIST</p>
        <h1>What are we watching?</h1>
        <p>Keep your favorite movies and shows in one place.</p>
        <p>Your next great watch starts here.</p>
      </section>

      <section className="form-card">
        <h2>
          {editingId !== null ? 'Edit your title' : 'Add a movie or show'}
        </h2>
        <p>Enter a title to manage your StreamList.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="movie-title">Movie or show title</label>
          <input
            id="movie-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g., Stranger Things"
          />

          <button type="submit" className="submit-button">
            <Icon>{editingId !== null ? 'save' : 'add_circle'}</Icon>
            {editingId !== null ? 'Save Changes' : 'Add to StreamList'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-button"
              onClick={cancelEdit}
            >
              <Icon>close</Icon>
              Cancel Edit
            </button>
          )}
        </form>

        {message && (
          <p className="status-message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="watchlist">
        <div className="list-heading">
          <h2>My Watchlist</h2>
          <span>
            {movies.length} {movies.length === 1 ? 'title' : 'titles'}
          </span>
        </div>

        {movies.length === 0 ? (
          <p className="empty-state">
            Your watchlist is empty. Add your first movie or show above!
          </p>
        ) : (
          <ul className="movie-list">
            {movies.map((movie) => (
              <li className="movie-item" key={movie.id}>
                <button
                  type="button"
                  className="complete-button"
                  onClick={() => toggleComplete(movie.id)}
                  aria-label={
                    movie.completed
                      ? `Mark ${movie.title} incomplete`
                      : `Mark ${movie.title} complete`
                  }
                  title={movie.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  <Icon filled={movie.completed}>
                    {movie.completed
                      ? 'check_circle'
                      : 'radio_button_unchecked'}
                  </Icon>
                </button>

                <span
                  className={
                    movie.completed ? 'movie-title completed' : 'movie-title'
                  }
                >
                  {movie.title}
                  <small>
                    {movie.completed ? 'Completed' : 'Not completed'}
                  </small>
                </span>

                <div className="movie-actions">
                  <button
                    type="button"
                    onClick={() => editMovie(movie)}
                    aria-label={`Edit ${movie.title}`}
                    title="Edit title"
                  >
                    <Icon>edit</Icon>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMovie(movie.id)}
                    aria-label={`Delete ${movie.title}`}
                    title="Delete title"
                  >
                    <Icon>delete</Icon>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function MoviesPage() {
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchMovies(event) {
    event.preventDefault();

    const cleanSearch = search.trim();

    if (!cleanSearch) {
      setError('Please enter a movie title to search.');
      return;
    }

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    if (!apiKey) {
      setError('TMDB API key not found. Check your .env file.');
      return;
    }

    setLoading(true);
    setError('');
    setMovies([]);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanSearch)}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`TMDB Error ${response.status}: ${details}`);
      }

      const data = await response.json();
      setMovies(data.results || []);

      if (!data.results || data.results.length === 0) {
        setError('No movies found. Try another title.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-content">
      <section className="hero">
        <p className="eyebrow">DISCOVER SOMETHING TO WATCH</p>
        <h1>Find Your Next Movie</h1>
        <p>Search movies and explore information from TMDB.</p>
      </section>

      <section className="form-card">
        <h2>Search Movies</h2>

        <form onSubmit={searchMovies}>
          <label htmlFor="movie-search">Movie title</label>
          <input
            id="movie-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for a movie..."
          />

          <button type="submit" className="submit-button" disabled={loading}>
            <Icon>search</Icon>
            {loading ? 'Searching...' : 'Search Movies'}
          </button>
        </form>

        {error && <p className="status-message" role="status">{error}</p>}
      </section>

      <section className="watchlist">
        <h2>Search Results</h2>

        <div className="tmdb-grid">
          {movies.map((movie) => (
            <article className="tmdb-card" key={movie.id}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} movie poster`}
                />
              ) : (
                <div className="poster-placeholder">No poster available</div>
              )}

              <div className="tmdb-card-info">
                <h3>{movie.title}</h3>
                <p>
                  Release date: {movie.release_date || 'Not available'}
                </p>
                <p>
                  {movie.overview || 'No description available.'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="tmdb-credit">
        Movie information and images provided by TMDB.
      </p>
    </main>
  );
}

function CartPage() {
  return (
    <main className="page-content">
      <h1>
        <Icon>local_movies</Icon> Cart
      </h1>
      <p>
        Your selected movies and shows can be organized here in a future update.
      </p>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page-content">
      <h1>About StreamList</h1>
      <p>
        StreamList helps you organize the movies and shows you want to watch.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<StreamList />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </>
  );
}
