// import Database from 'better-sqlite3';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const db = new Database(join(__dirname, 'expenses.db'));

// db.exec(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT UNIQUE NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     created_at TEXT DEFAULT CURRENT_TIMESTAMP
//   );

//   CREATE TABLE IF NOT EXISTS expenses (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER NOT NULL,
//     amount INTEGER NOT NULL,
//     category TEXT NOT NULL,
//     description TEXT NOT NULL,
//     date TEXT NOT NULL,
//     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
//     idempotency_key TEXT UNIQUE,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//   );

//   CREATE INDEX IF NOT EXISTS idx_user_id ON expenses(user_id);
//   CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
//   CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
//   CREATE INDEX IF NOT EXISTS idx_idempotency_key ON expenses(idempotency_key);
//   CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
// `);

// export default db;


import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(
  join(__dirname, 'expenses.db'),
  (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  }
);

// Create tables + indexes
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      idempotency_key TEXT UNIQUE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON expenses(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_category ON expenses(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_date ON expenses(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_idempotency_key ON expenses(idempotency_key)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);
});

export default db;
