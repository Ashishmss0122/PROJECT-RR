const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecurefreelancesecret123!';

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password.' });
    }

    const pool = await getPool();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // Insert user (default not admin, no bio, default profile image)
    const defaultProfile = '/uploads/default-avatar.png';
    const [result] = await pool.query(
      'INSERT INTO users (fullName, email, password, profileImage, isAdmin) VALUES (?, ?, ?, ?, 0)',
      [fullName, email, hashedPassword, defaultProfile]
    );

    const userId = result.insertId;

    // Create token
    const token = jwt.sign(
      { id: userId, email, isAdmin: 0 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        fullName,
        email,
        bio: '',
        skills: '',
        profileImage: defaultProfile,
        isAdmin: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio || '',
        skills: user.skills || '',
        profileImage: user.profileImage,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, fullName, email, bio, skills, profileImage, isAdmin, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, skills } = req.body;
    const pool = await getPool();

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    await pool.query(
      'UPDATE users SET fullName = ?, bio = ?, skills = ? WHERE id = ?',
      [fullName, bio || '', skills || '', req.user.id]
    );

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: req.user.id,
        fullName,
        bio,
        skills
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Relative web-accessible path
    const profileImagePath = `/uploads/${req.file.filename}`;
    const pool = await getPool();

    await pool.query('UPDATE users SET profileImage = ? WHERE id = ?', [profileImagePath, req.user.id]);

    res.status(200).json({
      message: 'Avatar uploaded successfully.',
      profileImage: profileImagePath
    });
  } catch (error) {
    next(error);
  }
};
