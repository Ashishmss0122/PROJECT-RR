const { getPool } = require('../config/db');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, budget, deadline, requiredSkills, category } = req.body;

    if (!title || !description || !budget || !deadline || !category) {
      return res.status(400).json({ message: 'Title, description, budget, deadline, and category are required.' });
    }

    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO projects (clientId, title, description, budget, deadline, requiredSkills, category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [req.user.id, title, description, parseFloat(budget), deadline, requiredSkills || '', category]
    );

    res.status(201).json({
      message: 'Project posted successfully.',
      projectId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { search, category, skill } = req.query;
    const pool = await getPool();

    let query = `
      SELECT p.*, u.fullName as clientName, u.profileImage as clientImage
      FROM projects p
      JOIN users u ON p.clientId = u.id
      WHERE p.status = 'Open'
    `;
    const queryParams = [];

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND p.category = ?`;
      queryParams.push(category);
    }

    if (skill) {
      query += ` AND p.requiredSkills LIKE ?`;
      queryParams.push(`%${skill}%`);
    }

    query += ` ORDER BY p.createdAt DESC`;

    const [projects] = await pool.query(query, queryParams);
    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

exports.getMyPostedProjects = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [projects] = await pool.query(
      `SELECT p.*, 
       (SELECT COUNT(*) FROM bids WHERE projectId = p.id) as applicantCount
       FROM projects p 
       WHERE p.clientId = ? 
       ORDER BY p.createdAt DESC`,
      [req.user.id]
    );

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT p.*, u.fullName as clientName, u.email as clientEmail, u.bio as clientBio, u.profileImage as clientImage
       FROM projects p
       JOIN users u ON p.clientId = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json({ project: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { title, description, budget, deadline, requiredSkills, category, status } = req.body;
    const pool = await getPool();

    // Check project client
    const [rows] = await pool.query('SELECT clientId FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = rows[0];
    if (project.clientId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You do not own this project.' });
    }

    await pool.query(
      `UPDATE projects 
       SET title = ?, description = ?, budget = ?, deadline = ?, requiredSkills = ?, category = ?, status = ?
       WHERE id = ?`,
      [title, description, parseFloat(budget), deadline, requiredSkills || '', category, status || 'Open', req.params.id]
    );

    res.status(200).json({ message: 'Project updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const pool = await getPool();

    // Check project client
    const [rows] = await pool.query('SELECT clientId FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = rows[0];
    if (project.clientId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You do not own this project.' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
