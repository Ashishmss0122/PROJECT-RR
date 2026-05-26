const { getPool } = require('../config/db');

exports.getMyContracts = async (req, res, next) => {
  try {
    const pool = await getPool();
    // Fetch contracts where user is either client or freelancer
    const [contracts] = await pool.query(
      `SELECT c.*, p.title as projectTitle, p.category as projectCategory,
              uClient.fullName as clientName, uClient.profileImage as clientImage,
              uFree.fullName as freelancerName, uFree.profileImage as freelancerImage,
              pay.paymentStatus
       FROM contracts c
       JOIN projects p ON c.projectId = p.id
       JOIN users uClient ON c.clientId = uClient.id
       JOIN users uFree ON c.freelancerId = uFree.id
       LEFT JOIN payments pay ON pay.contractId = c.id
       WHERE c.clientId = ? OR c.freelancerId = ?
       ORDER BY c.createdAt DESC`,
      [req.user.id, req.user.id]
    );

    res.status(200).json({ contracts });
  } catch (error) {
    next(error);
  }
};

exports.getContractById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const [rows] = await pool.query(
      `SELECT c.*, p.title as projectTitle, p.description as projectDescription, p.category as projectCategory,
              uClient.fullName as clientName, uClient.email as clientEmail, uClient.profileImage as clientImage,
              uFree.fullName as freelancerName, uFree.email as freelancerEmail, uFree.profileImage as freelancerImage
       FROM contracts c
       JOIN projects p ON c.projectId = p.id
       JOIN users uClient ON c.clientId = uClient.id
       JOIN users uFree ON c.freelancerId = uFree.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    const contract = rows[0];

    // Verify membership
    if (contract.clientId !== req.user.id && contract.freelancerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You are not a party to this contract.' });
    }

    // Fetch payments status
    const [payments] = await pool.query('SELECT * FROM payments WHERE contractId = ?', [id]);
    contract.payment = payments[0] || null;

    // Fetch files
    const [files] = await pool.query(
      `SELECT f.*, u.fullName as uploadedByName
       FROM uploaded_files f
       JOIN users u ON f.uploadedById = u.id
       WHERE f.contractId = ?
       ORDER BY f.createdAt DESC`,
      [id]
    );
    contract.files = files;

    res.status(200).json({ contract });
  } catch (error) {
    next(error);
  }
};

exports.submitContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Verify freelancer identity
    const [rows] = await pool.query('SELECT freelancerId, contractStatus FROM contracts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    const contract = rows[0];
    if (contract.freelancerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the hired freelancer can submit work.' });
    }

    if (contract.contractStatus === 'Completed') {
      return res.status(400).json({ message: 'Contract is already completed.' });
    }

    await pool.query(
      "UPDATE contracts SET contractStatus = 'Submitted' WHERE id = ?",
      [id]
    );

    res.status(200).json({ message: 'Work marked as submitted. Client has been notified.' });
  } catch (error) {
    next(error);
  }
};

exports.completeContract = async (req, res, next) => {
  const connection = await (await getPool()).getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    // Verify client identity
    const [rows] = await connection.query('SELECT * FROM contracts WHERE id = ?', [id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Contract not found.' });
    }

    const contract = rows[0];
    if (contract.clientId !== req.user.id && !req.user.isAdmin) {
      await connection.rollback();
      return res.status(403).json({ message: 'Only the client can release funds and complete the contract.' });
    }

    if (contract.contractStatus === 'Completed') {
      await connection.rollback();
      return res.status(400).json({ message: 'Contract is already completed.' });
    }

    // 1. Update contract to Completed
    await connection.query("UPDATE contracts SET contractStatus = 'Completed' WHERE id = ?", [id]);

    // 2. Update project to Completed
    await connection.query("UPDATE projects SET status = 'Completed' WHERE id = ?", [contract.projectId]);

    // 3. Update payment status to Released / Completed
    await connection.query("UPDATE payments SET paymentStatus = 'Released' WHERE contractId = ?", [id]);

    await connection.commit();
    res.status(200).json({ message: 'Escrow released! Contract successfully completed.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
