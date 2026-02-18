// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import db from './database.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// const JWT_EXPIRY = '7d';

// export async function hashPassword(password) {
//   return await bcrypt.hash(password, 10);
// }

// export async function verifyPassword(password, hash) {
//   return await bcrypt.compare(password, hash);
// }

// export function generateToken(userId) {
//   return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
// }

// export function verifyToken(token) {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch (error) {
//     return null;
//   }
// }

// export function extractToken(authHeader) {
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return null;
//   }
//   return authHeader.slice(7);
// }

// export function authMiddleware(req, res, next) {
//   const token = extractToken(req.headers.authorization);

//   if (!token) {
//     return res.status(401).json({ error: 'Missing authorization token' });
//   }

//   const decoded = verifyToken(token);

//   if (!decoded) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }

//   const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(decoded.userId);

//   if (!user) {
//     return res.status(401).json({ error: 'User not found' });
//   }

//   req.user = user;
//   next();
// }

// export async function registerUser(username, email, password) {
//   const existingUser = db.prepare(
//     'SELECT id FROM users WHERE username = ? OR email = ?'
//   ).get(username, email);

//   if (existingUser) {
//     throw new Error('Username or email already exists');
//   }

//   const hashedPassword = await hashPassword(password);

//   const result = db.prepare(
//     'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
//   ).run(username, email, hashedPassword);

//   return {
//     id: result.lastInsertRowid,
//     username,
//     email,
//   };
// }

// export async function loginUser(email, password) {
//   const user = db.prepare('SELECT id, username, email, password FROM users WHERE email = ?').get(email);

//   if (!user) {
//     throw new Error('Invalid email or password');
//   }

//   const passwordMatch = await verifyPassword(password, user.password);

//   if (!passwordMatch) {
//     throw new Error('Invalid email or password');
//   }

//   return {
//     id: user.id,
//     username: user.username,
//     email: user.email,
//   };
// }


import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

/* ---------------- Utility DB Helpers (Promise Wrapper) ---------------- */

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
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

/* ---------------- Password Helpers ---------------- */

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/* ---------------- JWT Helpers ---------------- */

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/* ---------------- Auth Middleware ---------------- */

export async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await dbGet(
      'SELECT id, username, email FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/* ---------------- Register ---------------- */

export async function registerUser(username, email, password) {
  const existingUser = await dbGet(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const result = await dbRun(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  return {
    id: result.lastID,
    username,
    email,
  };
}

/* ---------------- Login ---------------- */

export async function loginUser(email, password) {
  const user = await dbGet(
    'SELECT id, username, email, password FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await verifyPassword(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
