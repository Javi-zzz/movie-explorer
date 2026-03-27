import React, { useEffect, useState } from "react";
import "./App.css";

const API_KEY = "55525f691ef74075225c23ebe880895f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMovies();
  }, [page, query]);

  useEffect(() => {
    applySort();
  }, [sort]);

  const fetchMovies = async () => {
    try {
      const endpoint = query.trim()
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
            query
          )}&page=${page}`
        : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      let results = Array.isArray(data.results) ? data.results : [];
      results = sortMovies(results, sort);

      setMovies(results);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      setTotalPages(1);
    }
  };

  const sortMovies = (items, sortValue) => {
    const sorted = [...items];

    if (sortValue === "release_desc") {
      sorted.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    } else if (sortValue === "release_asc") {
      sorted.sort((a, b) => (a.release_date || "").localeCompare(b.release_date || ""));
    } else if (sortValue === "rating_desc") {
      sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortValue === "rating_asc") {
      sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    }

    return sorted;
  };

  const applySort = () => {
    setMovies((prev) => sortMovies(prev, sort));
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  return (
    <>
      <header>
        <div className="header-bar">
          <h1 className="title">Movie Explorer</h1>
        </div>

        <div className="controls-bar">
          <div className="controls">
            <label className="search-wrap" aria-label="Search movies by title">
              <input
                type="search"
                placeholder="Search for a movie…"
                autoComplete="off"
                value={query}
                onChange={handleSearchChange}
              />
            </label>

            <label className="sort-wrap" htmlFor="sortSelect">
              <span className="sort-label">Sort by:</span>
              <select
                id="sortSelect"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="" disabled hidden>
                  Sort By
                </option>
                <option value="release_desc">Release date (newest)</option>
                <option value="release_asc">Release date (oldest)</option>
                <option value="rating_desc">Average rating (highest)</option>
                <option value="rating_asc">Average rating (lowest)</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <main>
        <section className="grid" aria-live="polite">
          {movies.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%" }}>No movies found.</p>
          ) : (
            movies.map((movie) => (
              <article key={movie.id} className="card">
                <div className="poster-wrap">
                  {movie.poster_path ? (
                    <img
                      className="poster"
                      src={`${IMG_BASE}${movie.poster_path}`}
                      alt={`${movie.title} poster`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="poster fallback">No Poster</div>
                  )}
                </div>

                <div className="meta">
                  <h2 className="name">{movie.title || "Untitled"}</h2>
                  <p className="sub date">
                    Release Date: {movie.release_date || "Unknown"}
                  </p>
                  <p className="rating">
                    Rating:{" "}
                    {typeof movie.vote_average === "number"
                      ? movie.vote_average.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <footer className="pager">
        <button
          className="btn"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>

        <span className="page-info">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </footer>
    </>
  );
}