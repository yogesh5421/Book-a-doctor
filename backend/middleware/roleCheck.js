module.exports = function(allowedRoles = []) {
  // allowedRoles: ['admin'], ['doctor'], ['patient','admin']
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
  };
};