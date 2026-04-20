const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'library_management',
    password: 'root', // YOUR PASSWORD
    port: 5432,
});

// Test connection
pool.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL');
    }
});

const JWT_SECRET = 'library_secret_key_2024';

// ============ AUTH MIDDLEWARE ============
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
};

// ============ AUTH ENDPOINTS ============
app.post('/api/register', async (req, res) => {
    const { name, email, password, phone, student_id, class: className } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, phone, student_id, class, role) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, email, hashedPassword, phone, student_id, className, 'student']
        );
        res.json({ message: 'Registration successful!' });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ BOOKS ENDPOINT - THIS IS WHAT YOU NEED ============
app.get('/api/books', async (req, res) => {
    console.log('📚 Books API called'); // This will show in terminal
    try {
        const result = await pool.query("SELECT * FROM items WHERE category = 'books'");
        console.log('Found', result.rows.length, 'books');
        res.json(result.rows);
    } catch (err) {
        console.error('Books error:', err);
        res.status(500).json({ error: 'Failed to fetch books', details: err.message });
    }
});

// ============ STATS ENDPOINT ============
app.get('/api/stats', auth, async (req, res) => {
    try {
        const booksResult = await pool.query("SELECT COALESCE(SUM(quantity), 0) as total FROM items WHERE category = 'books'");
        const sportsResult = await pool.query("SELECT COALESCE(SUM(quantity), 0) as total FROM items WHERE category = 'sports'");
        const labResult = await pool.query("SELECT COALESCE(SUM(quantity), 0) as total FROM items WHERE category = 'lab_equipment'");
        const uniformsResult = await pool.query("SELECT COALESCE(SUM(quantity), 0) as total FROM items WHERE category = 'uniforms'");
        const activeIssues = await pool.query("SELECT COUNT(*) FROM issues WHERE status = 'issued'");
        const totalStudents = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
        
        res.json({
            books: { total: parseInt(booksResult.rows[0].total), available: parseInt(booksResult.rows[0].total), trend: 5 },
            sports: { total: parseInt(sportsResult.rows[0].total), available: parseInt(sportsResult.rows[0].total), trend: 2 },
            lab: { total: parseInt(labResult.rows[0].total), available: parseInt(labResult.rows[0].total), trend: 12 },
            uniforms: { total: parseInt(uniformsResult.rows[0].total), available: parseInt(uniformsResult.rows[0].total), trend: 8 },
            activeIssues: parseInt(activeIssues.rows[0].count),
            totalStudents: parseInt(totalStudents.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============ MY BORROWINGS ============
app.get('/api/my-borrowings', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, it.name as title, it.author 
             FROM issues i 
             JOIN items it ON i.item_id = it.id 
             WHERE i.user_id = $1 AND i.status = 'issued'
             ORDER BY i.due_date ASC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

// ============ ITEMS ENDPOINT ============
app.get('/api/items', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// ============ SAMPLE DATA ============
async function initializeDatabase() {
    try {
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5)',
                ['Admin User', 'admin@library.com', hashedPassword, '9999999999', 'admin']
            );
            console.log('✅ Admin created: admin@library.com / admin123');
        }
        
        const itemCount = await pool.query('SELECT COUNT(*) FROM items');
        if (parseInt(itemCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO items (name, category, sub_category, item_code, quantity, available_quantity, location) VALUES
                ('The Great Gatsby', 'books', 'Fiction', 'BK001', 5, 5, 'A-101'),
                ('1984', 'books', 'Sci-Fi', 'BK002', 3, 3, 'A-102'),
                ('To Kill a Mockingbird', 'books', 'Fiction', 'BK003', 4, 4, 'A-103'),
                ('Cricket Bat', 'sports', 'Cricket', 'SP001', 15, 15, 'Sports Room'),
                ('Football', 'sports', 'Football', 'SP002', 20, 20, 'Sports Room'),
                ('Microscope', 'lab_equipment', 'Biology', 'LB001', 25, 25, 'Lab 1')
            `);
            console.log('✅ Sample items inserted');
        }
    } catch (err) {
        console.error('Init error:', err.message);
    }
}

initializeDatabase();

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🏫 Server running on http://localhost:${PORT}`);
    console.log(`📚 Test books API: http://localhost:${PORT}/api/books`);
});