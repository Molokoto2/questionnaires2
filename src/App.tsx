import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import CreateSurvey from './pages/CreateSurvey';
import SurveyList from './pages/SurveyList';
import TakeSurvey from './pages/TakeSurvey';
import Results from './pages/Results';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<SurveyList />} />
            <Route path="/create" element={<CreateSurvey />} />
            <Route path="/survey/:id" element={<TakeSurvey />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;