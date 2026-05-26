const { getPool } = require('../config/db');

exports.getMyLedger = async (req, res, next) => {
  try {
    const pool = await getPool();
    const userId = req.user.id;

    const [ledger] = await pool.query(
      `SELECT pay.*, c.agreedAmount, c.clientId, c.freelancerId,
              p.title as projectTitle, uClient.fullName as clientName, uFree.fullName as freelancerName
       FROM payments pay
       JOIN contracts c ON pay.contractId = c.id
       JOIN projects p ON c.projectId = p.id
       JOIN users uClient ON c.clientId = uClient.id
       JOIN users uFree ON c.freelancerId = uFree.id
       WHERE c.clientId = ? OR c.freelancerId = ?
       ORDER BY pay.createdAt DESC`,
      [userId, userId]
    );

    res.status(200).json({ ledger });
  } catch (error) {
    next(error);
  }
};
