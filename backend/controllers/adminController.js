const { getPool } = require('../config/db');

exports.getAllUsers = async (req, res, next) => {
  try {
    const pool = await getPool();
    // Return all users, excluding passwords
    const [users] = await pool.query(
      'SELECT id, fullName, email, bio, skills, profileImage, isAdmin, createdAt FROM users ORDER BY createdAt DESC'
    );
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [projects] = await pool.query(
      `SELECT p.*, u.fullName as clientName
       FROM projects p
       JOIN users u ON p.clientId = u.id
       ORDER BY p.createdAt DESC`
    );
    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

exports.getAllContracts = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [contracts] = await pool.query(
      `SELECT c.*, p.title as projectTitle,
              uClient.fullName as clientName,
              uFree.fullName as freelancerName,
              pay.paymentStatus
       FROM contracts c
       JOIN projects p ON c.projectId = p.id
       JOIN users uClient ON c.clientId = uClient.id
       JOIN users uFree ON c.freelancerId = uFree.id
       LEFT JOIN payments pay ON pay.contractId = c.id
       ORDER BY c.createdAt DESC`
    );
    res.status(200).json({ contracts });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpamProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const [rows] = await pool.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.status(200).json({ message: 'Project removed as spam successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpamUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot ban or delete your own administrator account.' });
    }

    const pool = await getPool();
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted and banned from the platform.' });
  } catch (error) {
    next(error);
  }
};
