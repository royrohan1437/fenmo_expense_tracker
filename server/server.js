import express from 'express';
import cors from 'cors';
import db from './database.js';
import { registerUser, loginUser, generateToken, authMiddleware } from './auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

/* ------------------ Helper DB Wrappers ------------------ */

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/* ------------------ Auth Routes ------------------ */

app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await registerUser(username, email, password);
    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await loginUser(email, password);
    const token = generateToken(user.id);

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

/* ------------------ Create Expense ------------------ */

app.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date, idempotencyKey } = req.body;

    if (!amount || !category || !description || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await dbGet(
        'SELECT * FROM expenses WHERE idempotency_key = ? AND user_id = ?',
        [idempotencyKey, req.user.id]
      );

      if (existing) {
        return res.status(200).json({
          id: existing.id,
          amount: existing.amount / 100,
          category: existing.category,
          description: existing.description,
          date: existing.date,
          created_at: existing.created_at
        });
      }
    }

    const result = await dbRun(
      'INSERT INTO expenses (user_id, amount, category, description, date, idempotency_key) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, amountInCents, category, description, date, idempotencyKey || null]
    );

    const expense = await dbGet(
      'SELECT * FROM expenses WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      id: expense.id,
      amount: expense.amount / 100,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      created_at: expense.created_at
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------ Get Expenses ------------------ */

app.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const { category, sort } = req.query;

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (sort === 'date_desc') {
      query += ' ORDER BY date DESC, id DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const expenses = await dbAll(query, params);

    const formatted = expenses.map(expense => ({
      id: expense.id,
      amount: expense.amount / 100,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      created_at: expense.created_at
    }));

    res.json(formatted);

  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------ Categories ------------------ */

app.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await dbAll(
      'SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category',
      [req.user.id]
    );

    res.json(categories.map(c => c.category));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------ Current User ------------------ */

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Serve frontend build
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
