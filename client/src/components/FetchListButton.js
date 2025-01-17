import React, { useState } from 'react';
import axios from './axiosInstance'; // Use your axios instance if you have one, or just import axios directly

const FetchSetlistsButton = ({ mbid, onSetlistsFetched }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchSetlists = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/artists/${mbid}/setlists`);
            onSetlistsFetched(response.data.setlists || []); // Pass fetched setlists to parent component
        } catch (error) {
            console.error('Error fetching setlists:', error.message);
            alert('Failed to fetch setlists.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleFetchSetlists} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch Setlists'}
        </button>
    );
};

export default FetchSetlistsButton;
