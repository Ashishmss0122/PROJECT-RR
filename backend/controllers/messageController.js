const { getPool } = require('../config/db');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, projectId, messageText } = req.body;

    if (!receiverId || !messageText) {
      return res.status(400).json({ message: 'Receiver ID and message text are required.' });
    }

    const pool = await getPool();

    // Verify receiver exists
    const [receiverCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [receiverId]);
    if (receiverCheck.length === 0) {
      return res.status(404).json({ message: 'Receiver user not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO messages (senderId, receiverId, projectId, messageText)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, receiverId, projectId || null, messageText]
    );

    res.status(201).json({
      message: 'Message sent successfully.',
      msg: {
        id: result.insertId,
        senderId: req.user.id,
        receiverId,
        projectId: projectId || null,
        messageText,
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getChatsList = async (req, res, next) => {
  try {
    const pool = await getPool();
    const userId = req.user.id;

    // Subquery retrieves the last message text and timestamp with each chat partner
    const [chats] = await pool.query(
      `SELECT DISTINCT u.id, u.fullName, u.profileImage, u.skills,
        (SELECT messageText FROM messages
         WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id)
         ORDER BY createdAt DESC LIMIT 1) as lastMessage,
        (SELECT createdAt FROM messages
         WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id)
         ORDER BY createdAt DESC LIMIT 1) as lastMessageTime
      FROM users u
      WHERE u.id != ? AND u.id IN (
        SELECT senderId FROM messages WHERE receiverId = ?
        UNION
        SELECT receiverId FROM messages WHERE senderId = ?
      )
      ORDER BY lastMessageTime DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    );

    res.status(200).json({ chats });
  } catch (error) {
    next(error);
  }
};

exports.getMessageThread = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const pool = await getPool();
    const userId = req.user.id;

    const [messages] = await pool.query(
      `SELECT m.*, sender.fullName as senderName, receiver.fullName as receiverName
       FROM messages m
       JOIN users sender ON m.senderId = sender.id
       JOIN users receiver ON m.receiverId = receiver.id
       WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
       ORDER BY m.createdAt ASC`,
      [userId, otherUserId, otherUserId, userId]
    );

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};
