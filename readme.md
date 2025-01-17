# Setlist Analysis

A Node.js application for analyzing and managing setlist data for artists using the Setlist.fm API. This project tracks song sequences, analyzes their frequency and patterns, and provides tools to visualize unique trends in setlists.

## Features

- Fetch artist data and setlists from the Setlist.fm API.
- Store and manage artist and setlist data in a PostgreSQL database.
- Analyze song sequences to detect patterns and consistency.
- Support for filtering by year during analysis.
- Track sequence analysis metadata for better reporting.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Technologies

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Dependencies**:
  - `axios` for API requests
  - `dotenv` for environment variable management
  - `pg` for PostgreSQL integration

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) (v12 or later)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/heady-setlist-analysis.git
   cd heady-setlist-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```plaintext
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=setlistdb
   SETLISTFM_API_KEY=your_setlistfm_api_key
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```
   This will create all necessary tables.

5. Start the application:
   ```bash
   npm start
   ```

## Database Schema

The database contains the following tables:

1. **artists**: Stores artist metadata.
2. **setlists**: Stores individual setlists.
3. **setlist_counts**: Tracks the number of setlists for each artist.
4. **song_sequences**: Tracks sequences of songs and their frequencies.
5. **sequence_analysis**: Logs metadata for sequence analyses.

See the [`schema.sql`](schema.sql) file for details.

## Usage

### Running the Analysis

1. Fetch artist data and setlists:
   ```bash
   npm run fetch:artist
   npm run fetch:setlists
   ```

2. Analyze song sequences:
   ```bash
   npm run analyze:sequences --artistId=1 --length=5 --year=2023
   ```

### Commands

- **`npm run fetch:artist`**: Fetch artist data from Setlist.fm.
- **`npm run fetch:setlists`**: Fetch setlists for stored artists.
- **`npm run analyze:sequences`**: Analyze song sequences for a specific artist.

## API Endpoints

### Base URL

`http://localhost:5001`

### Available Endpoints

1. **GET /api/artists**: Retrieve all stored artists.
2. **POST /api/artists**: Add a new artist.
3. **GET /api/setlists/:artistId**: Retrieve setlists for an artist.
4. **GET /api/analyze/:artistId**: Analyze sequences for an artist.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push your changes and create a pull request.

---

For questions or suggestions, feel free to open an issue or contribute to the project. Happy coding!

