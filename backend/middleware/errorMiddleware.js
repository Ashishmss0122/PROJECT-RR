module.exports = (err, req, res, next) => {
  console.error('SERVER ERROR STACK:', err.stack || err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle specific MySQL/Duplicate errors nicely
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      message: 'A record with this identifier already exists.'
    });
  }

  res.status(status).json({
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};
