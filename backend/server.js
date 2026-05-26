const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const contractRoutes = require('./routes/contractRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const fileRoutes = require('./routes/fileRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Programmatically create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created.');
}

// Copy default avatar if it doesn't exist
const defaultAvatarPath = path.join(uploadsDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Create a blank/simple placeholder file or just write a basic SVG/file
  // Writing a simple text or a small 1x1 base64 transparent gif
  const base64Gif = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  fs.writeFileSync(defaultAvatarPath, Buffer.from(base64Gif, 'base64'));
  console.log('Default avatar placeholder created.');
}

// Enable CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API Routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

// Root route check
app.get('/', (req, res) => {
  res.json({ message: 'SecureFreelance REST API is active.' });
});

// Central Error Handler
app.use(errorMiddleware);

// Initialize DB and startup server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`SecureFreelance server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Fatal database initialization error:', err);
  process.exit(1);
});
