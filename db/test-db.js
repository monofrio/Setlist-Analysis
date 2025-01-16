const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'setlistuser',
    host: 'localhost',
    database: 'setlistdb',
    password: 'password123',
    port: 5432,
});

(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected successfully:', res.rows[0]);
    } catch (err) {
        console.error('Database connection error:', err.message);
    } finally {
        pool.end();
    }
})();
