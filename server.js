const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        age INTEGER NOT NULL,
        hobbies TEXT
    )
`);
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const users = rows.map(user => ({
            ...user,
            hobbies: user.hobbies
                ? JSON.parse(user.hobbies)
                : []
        }));
        res.json(users);
    });
});
app.post('/users', (req, res) => {
    const { fullName, email, age, hobbies } = req.body;
    db.run(
        `INSERT INTO users (fullName, email, age, hobbies)
         VALUES (?, ?, ?, ?)`,
        [fullName, email, age, JSON.stringify(hobbies)],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            res.status(201).json({
                message: 'User added successfully',
                id: this.lastID
            });
        }
    );
});
app.put('/users/:id', (req, res) => {
    const { fullName, email, age, hobbies } = req.body;
    db.run(
        `UPDATE users
         SET fullName = ?,
             email = ?,
             age = ?,
             hobbies = ?
         WHERE id = ?`,
        [
            fullName,
            email,
            age,
            JSON.stringify(hobbies),
            req.params.id
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            res.json({
                message: 'User updated successfully'
            });
        }
    );
});
app.delete('/users/:id', (req, res) => {
    db.run(
        'DELETE FROM users WHERE id = ?',
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }
            res.json({
                message: 'User deleted successfully'
            });
        }
    );
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});