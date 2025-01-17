import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import ArtistList from './ArtistList';
import SetlistViewer from "./SetlistViewer";

const Dashboard = () => {
    const [artists, setArtists] = useState([]);
    const [error, setError] = useState('');

    const fetchArtists = async () => {
        try {
            // console.log('Fetching artists from backend...');
            const response = await axiosInstance.get('/api/artists'); // Use the configured Axios instance
            // console.log('Fetched artists:', response.data.artists);
            setArtists(response.data.artists || []);
        } catch (err) {
            console.error('Error fetching artists:', err.message);
            setError('Failed to fetch artists.');
        }
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {artists.length > 0 ? (
                <ArtistList artists={artists} onRefresh={fetchArtists} />
            ) : (
                <p>No artists found in the database.</p>
            )}

        </div>
    );
};

export default Dashboard;
