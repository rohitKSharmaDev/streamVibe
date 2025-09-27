import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = () => <h1>Home Page</h1>;
const MovieDetails = () => <h1>Movie Details Page</h1>;

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie-details" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;