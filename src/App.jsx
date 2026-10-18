import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

function Navbar() {
  return (
    <header className="navbar">
      <NavLink className="brand" to="/">
        ▶ StreamList
      </NavLink>

      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
}

function StreamList() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const movieTitle = title.trim();

    if (!movieTitle) {
      setMessage('Please enter a movie or show title.');
      return;
    }

    console.log('StreamList submission:', movieTitle);
    setMessage(`"${movieTitle}" was submitted successfully!`);
    setTitle('');
  }

  return (
    <section className="home-page">
      <p className="eyebrow">YOUR PERSONAL WATCHLIST</p>
      <h1>What are we watching?</h1>
      <p className="intro">
        Keep your favorite movies and shows in one place. Your next great watch
        starts here.
      </p>

      <div className="form-card">
        <h2>Add a movie or show</h2>
        <p>Enter a title to get started with StreamList.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="movie-title">Movie or show title</label>
          <input
            id="movie-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g., Stranger Things"
          />
          <button type="submit">+ Add to StreamList</button>
        </form>

        {message && (
          <p className="feedback" role="status">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

function Movies() {
  return (
    <section className="placeholder-page">
      <h1>Movies</h1>
    </section>
  );
}

function Cart() {
  return (
    <section className="placeholder-page">
      <h1>Cart</h1>
    </section>
  );
}

function About() {
  return (
    <section className="placeholder-page">
      <h1>About</h1>
    </section>
  );
}

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<StreamList />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <footer>StreamList © 2026 | Your next favorite starts here.</footer>
    </div>
  );
}

export default App;
