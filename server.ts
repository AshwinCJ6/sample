import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = 3000;

interface User {
  id: number;
  fullName: string;
  email: string;
  age: number;
  hobbies: string[];
}

interface UserData {
  fullName: string;
  email: string;
  age: number;
  hobbies: string[];
}

const db = new sqlite3.Database('./users.db', (err: Error | null) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

app.use(cors());
app.use(express.json());

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL,
    hobbies TEXT
  )
`);

app.get('/users', (req: Request, res: Response): void => {
  db.all('SELECT * FROM users', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const users: User[] = rows.map((user: any) => ({
      ...user,
      hobbies: user.hobbies ? JSON.parse(user.hobbies) : []
    }));
    res.json(users);
  });
});

app.post('/users', (req: Request, res: Response): void => {
  const { fullName, email, age, hobbies }: UserData = req.body;
  db.run(
    `INSERT INTO users (fullName, email, age, hobbies)
     VALUES (?, ?, ?, ?)`,
    [fullName, email, age, JSON.stringify(hobbies)],
    function (err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        message: 'User added successfully',
        id: this.lastID
      });
    }
  );
});

app.put('/users/:id', (req: Request, res: Response): void => {
  const { fullName, email, age, hobbies }: UserData = req.body;
  db.run(
    `UPDATE users
     SET fullName = ?,
         email = ?,
         age = ?,
         hobbies = ?
     WHERE id = ?`,
    [fullName, email, age, JSON.stringify(hobbies), req.params.id],
    function (err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

app.delete('/users/:id', (req: Request, res: Response): void => {
  db.run(
    'DELETE FROM users WHERE id = ?',
    [req.params.id],
    function (err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'User deleted successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
