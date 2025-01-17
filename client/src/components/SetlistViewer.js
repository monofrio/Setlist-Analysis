import React, { useState, useEffect } from 'react';
import axios from './axiosInstance';

const SetlistViewer = ({ mbid }) => {
    const [setlists, setSetlists] = useState([]);
    const [totalSetlists, setTotalSetlists] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSetlists = async (page) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`/api/setlistfm/${mbid}/setlists`, {
                params: { page },
            });

            setSetlists(response.data.setlists);
            setTotalSetlists(response.data.totalSetlists);
        } catch (err) {
            console.error('Error fetching setlists:', err.message);
            setError('Failed to fetch setlists. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSetlists(currentPage);
    }, [currentPage, mbid]);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(totalSetlists / 20)) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div>
            <h1>Setlists</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <p>Total Setlists: {totalSetlists}</p>
                    <ul>
                        {setlists.map((setlist) => (
                            <li key={setlist.id}>
                                <strong>{setlist.eventDate}</strong> -{' '}
                                {setlist.venue?.name || 'Unknown Venue'}, {setlist.city?.name || 'Unknown City'}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {Math.ceil(totalSetlists / 20)}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= Math.ceil(totalSetlists / 20)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SetlistViewer;
