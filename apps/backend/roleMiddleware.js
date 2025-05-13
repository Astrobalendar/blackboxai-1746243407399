// Express middleware for role-based access control
function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

// Usage Example:
// app.get('/dashboard', requireRole('astrologer'), dashboardHandler);

module.exports = { requireRole };
