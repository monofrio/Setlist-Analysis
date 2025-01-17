import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ArtistSearch from "./components/ArtistSearch";

function App() {
    return (
        <Router>
            <div>
                <nav>
                    <Link to="/">Home</Link> | <Link to="/search">Add Artist</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/search" element={<ArtistSearch />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
