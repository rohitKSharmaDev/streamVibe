import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage/MainPage';
import MovieDetailsPage from './pages/MovieDetailsPage/MovieDetailsPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/movie-details" element={<MovieDetailsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;