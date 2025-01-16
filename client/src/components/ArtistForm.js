import React, { useState } from 'react';
import axios from 'axios';

const ArtistForm = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle search for artists
    const handleSearch = async () => {
        setMessage('');
        setError('');

        if (!searchQuery) {
            setError('Please enter a search term.');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5001/api/artists/search?query=${searchQuery}`);
            setSearchResults(response.data.artists || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch artists.');
        }
    };

    // Handle adding the selected artist to the database
    const handleAddArtist = async (artist) => {
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:5001/api/artists', { artistName: artist.name });
            setMessage(`Artist "${artist.name}" added successfully.`);
            setSelectedArtist(null);
            setSearchResults([]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add artist.');
        }
    };

    return (
        <div>
            <h1>Search and Add Artist</h1>
            {/* Search Input */}
            <div>
                <input
                    type="text"
                    placeholder="Search for an artist"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div>
                    <h2>Search Results</h2>
                    <ul>
                        {searchResults.map((artist) => (
                            <li key={artist.id}>
                                {artist.name}{' '}
                                <button onClick={() => handleAddArtist(artist)}>Add</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Messages */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ArtistForm;
