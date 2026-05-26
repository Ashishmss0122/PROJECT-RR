const { getPool } = require('../config/db');

exports.placeBid = async (req, res, next) => {
  try {
    const { projectId, proposal, bidAmount, deliveryTime } = req.body;

    if (!projectId || !proposal || !bidAmount || !deliveryTime) {
      return res.status(400).json({ message: 'Project ID, proposal, bid amount, and delivery time are required.' });
    }

    const pool = await getPool();

    // 1. Verify project exists, is open, and not owned by the bidder
    const [projects] = await pool.query('SELECT clientId, status FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = projects[0];
    if (project.clientId === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply/bid on your own project.' });
    }

    if (project.status !== 'Open') {
      return res.status(400).json({ message: 'This project is no longer open for applications.' });
    }

    // 2. Check if already bid
    const [existingBids] = await pool.query(
      'SELECT id FROM bids WHERE projectId = ? AND freelancerId = ?',
      [projectId, req.user.id]
    );

    if (existingBids.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this project.' });
    }

    // 3. Insert bid
    await pool.query(
      `INSERT INTO bids (projectId, freelancerId, proposal, bidAmount, deliveryTime, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [projectId, req.user.id, proposal, parseFloat(bidAmount), parseInt(deliveryTime)]
    );

    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getBidsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const pool = await getPool();

    // Verify project belongs to current user (client) or user is admin
    const [projects] = await pool.query('SELECT clientId FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (projects[0].clientId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You do not own this project.' });
    }

    const [bids] = await pool.query(
      `SELECT b.*, u.fullName as freelancerName, u.email as freelancerEmail, u.skills as freelancerSkills, u.profileImage as freelancerImage
       FROM bids b
       JOIN users u ON b.freelancerId = u.id
       WHERE b.projectId = ?
       ORDER BY b.createdAt DESC`,
      [projectId]
    );

    res.status(200).json({ bids });
  } catch (error) {
    next(error);
  }
};

exports.getMyBids = async (req, res, next) => {
  try {
    const pool = await getPool();
    const [bids] = await pool.query(
      `SELECT b.*, p.title as projectTitle, p.category as projectCategory, p.status as projectStatus, u.fullName as clientName
       FROM bids b
       JOIN projects p ON b.projectId = p.id
       JOIN users u ON p.clientId = u.id
       WHERE b.freelancerId = ?
       ORDER BY b.createdAt DESC`,
      [req.user.id]
    );

    res.status(200).json({ bids });
  } catch (error) {
    next(error);
  }
};

exports.updateBidStatus = async (req, res, next) => {
  const connection = await (await getPool()).getConnection();
  try {
    const { id } = req.params; // Bid ID
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!status || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Accepted' or 'Rejected'." });
    }

    await connection.beginTransaction();

    // 1. Get bid details
    const [bids] = await connection.query('SELECT * FROM bids WHERE id = ?', [id]);
    if (bids.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Bid not found.' });
    }

    const bid = bids[0];

    // 2. Get project details and verify ownership
    const [projects] = await connection.query('SELECT * FROM projects WHERE id = ?', [bid.projectId]);
    if (projects.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = projects[0];
    if (project.clientId !== req.user.id && !req.user.isAdmin) {
      await connection.rollback();
      return res.status(403).json({ message: 'Forbidden. You do not own this project.' });
    }

    if (project.status !== 'Open') {
      await connection.rollback();
      return res.status(400).json({ message: 'This project is already In Progress or Completed.' });
    }

    if (status === 'Rejected') {
      // Simply reject the bid
      await connection.query('UPDATE bids SET status = ? WHERE id = ?', ['Rejected', id]);
      await connection.commit();
      return res.status(200).json({ message: 'Bid rejected successfully.' });
    }

    // status === 'Accepted'
    // A. Update accepted bid status
    await connection.query('UPDATE bids SET status = ? WHERE id = ?', ['Accepted', id]);

    // B. Reject other bids for this project
    await connection.query('UPDATE bids SET status = ? WHERE projectId = ? AND id != ?', ['Rejected', bid.projectId, id]);

    // C. Change project status to 'In Progress'
    await connection.query("UPDATE projects SET status = 'In Progress' WHERE id = ?", [bid.projectId]);

    // D. Create Contract
    // Calculate delivery date: today + bid.deliveryTime days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + parseInt(bid.deliveryTime));
    const formattedDeliveryDate = deliveryDate.toISOString().slice(0, 10);

    const [contractResult] = await connection.query(
      `INSERT INTO contracts (clientId, freelancerId, projectId, agreedAmount, deliveryDate, contractStatus)
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [project.clientId, bid.freelancerId, bid.projectId, bid.bidAmount, formattedDeliveryDate]
    );

    const contractId = contractResult.insertId;

    // E. Initialize Escrow Payment (status: Pending)
    await connection.query(
      `INSERT INTO payments (contractId, amount, paymentStatus)
       VALUES (?, ?, 'Pending')`,
      [contractId, bid.bidAmount]
    );

    await connection.commit();
    res.status(200).json({
      message: 'Bid accepted! Contract successfully created and escrow pending.',
      contractId
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
