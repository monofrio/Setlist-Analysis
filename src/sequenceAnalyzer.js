const extractSongsFromSetlist = (setlist) => {
    const songs = [];

    if (setlist.set && Array.isArray(setlist.set)) {
        setlist.set.forEach((set) => {
            if (set.song && Array.isArray(set.song)) {
                set.song.forEach((song) => {
                    if (song && song.name) {
                        songs.push(song.name.trim());
                    }
                });
            }
        });
    }

    return songs;
};

const generateNGrams = (songs, n) => {
    const nGrams = [];
    for (let i = 0; i <= songs.length - n; i++) {
        nGrams.push(songs.slice(i, i + n)); // Extract `n` consecutive songs
    }
    return nGrams;
};

const analyzeSetlistForLength = (setlist, length = 5) => {
    const songs = extractSongsFromSetlist(setlist);
    if (songs.length < length) {
        return []; // Not enough songs for the specified sequence length
    }
    return generateNGrams(songs, length);
};

const analyzeAllSetlistsForLength = (setlists, length = 5) => {
    const allSequences = [];
    setlists.forEach((setlist, index) => {
        console.log(`Processing Setlist ${index + 1}`);
        const sequences = analyzeSetlistForLength(setlist, length);
        allSequences.push(...sequences);
    });
    return allSequences;
};

module.exports = {
    extractSongsFromSetlist,
    generateNGrams,
    analyzeSetlistForLength,
    analyzeAllSetlistsForLength,
};
