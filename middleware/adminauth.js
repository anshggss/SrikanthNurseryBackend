const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token; // from cookie

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.admin) {
      req.admin = true;
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
