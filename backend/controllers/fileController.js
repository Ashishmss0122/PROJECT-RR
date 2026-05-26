const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');

exports.uploadFile = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const pool = await getPool();

    // Verify contract exists and belongs to the freelancer
    const [contracts] = await pool.query('SELECT * FROM contracts WHERE id = ?', [contractId]);
    if (contracts.length === 0) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    const contract = contracts[0];
    if (contract.freelancerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. Only the hired freelancer can upload work.' });
    }

    if (contract.contractStatus === 'Completed') {
      return res.status(400).json({ message: 'Cannot upload files to a completed contract.' });
    }

    const filePath = `uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    await pool.query(
      `INSERT INTO uploaded_files (contractId, uploadedById, fileName, filePath)
       VALUES (?, ?, ?, ?)`,
      [contractId, req.user.id, fileName, filePath]
    );

    res.status(201).json({
      message: 'File uploaded and delivered successfully.',
      file: {
        fileName,
        filePath
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const pool = await getPool();

    // Fetch file record
    const [files] = await pool.query('SELECT * FROM uploaded_files WHERE id = ?', [fileId]);
    if (files.length === 0) {
      return res.status(404).json({ message: 'File record not found.' });
    }

    const fileRecord = files[0];

    // Fetch contract details to verify user is Client, Freelancer, or Admin
    const [contracts] = await pool.query('SELECT * FROM contracts WHERE id = ?', [fileRecord.contractId]);
    if (contracts.length === 0) {
      return res.status(404).json({ message: 'Associated contract not found.' });
    }

    const contract = contracts[0];
    if (contract.clientId !== req.user.id && contract.freelancerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. You are not authorized to access this file.' });
    }

    // Resolve absolute path
    const absolutePath = path.resolve(__dirname, '..', fileRecord.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Physical file not found on server.' });
    }

    res.download(absolutePath, fileRecord.fileName);
  } catch (error) {
    next(error);
  }
};
