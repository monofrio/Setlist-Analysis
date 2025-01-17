import React, { useState, useEffect } from 'react';
import axios from './axiosInstance';

const ArtistSearch = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [storedArtists, setStoredArtists] = useState([]);
    const [message, setMessage] = useState('');

    // Fetch stored artists on component load
    useEffect(() => {
        const fetchStoredArtists = async () => {
            try {
                const response = await axios.get('/api/artists');
                setStoredArtists(response.data.artists.map((artist) => artist.mbid));
            } catch (error) {
                console.error('Error fetching stored artists:', error.message);
            }
        };

        fetchStoredArtists();
    }, []);

    // Handle search
    const handleSearch = async () => {
        try {
            const response = await axios.get(`/api/setlistfm/artists`, {
                params: { artistName: query },
            });

            const results = response.data.artist || [];
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching artists:', error.message);
            setMessage('Failed to fetch artists. Please try again.');
        }
    };

    // Handle add artist
    const handleAddArtist = async (artist) => {
        try {
            await axios.post('/api/artists', { name: artist.name, mbid: artist.mbid });
            setMessage(`Artist "${artist.name}" added successfully.`);
            setStoredArtists((prev) => [...prev, artist.mbid]); // Add to stored list
        } catch (error) {
            console.error('Error adding artist:', error.message);
            setMessage('Failed to add artist. Please try again.');
        }
    };

    return (
        <div>
            <h1>Search for Artists</h1>
            <input
                type="text"
                placeholder="Enter artist name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {message && <p>{message}</p>}

            {searchResults.length > 0 && (
                <ul>
                    {searchResults.map((artist) => (
                        <li key={artist.mbid}>
                            {artist.name}
                            {storedArtists.includes(artist.mbid) ? (
                                <span style={{ color: 'green', marginLeft: '10px' }}>Added</span>
                            ) : (
                                <button onClick={() => handleAddArtist(artist)}>Add</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ArtistSearch;
