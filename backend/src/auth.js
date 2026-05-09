const jwt = require('jsonwebtoken');

const SECRET = 'my-shelf-secret-change-in-prod';

const ROLE_PERMISSIONS = {
  ADMIN:   ['READ', 'WRITE', 'DELETE'],
  WRITER:  ['READ', 'WRITE'],
  VISITOR: ['READ'],
};

function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1m' });
}

function requirePermission(permission) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    try {
      const payload = jwt.verify(header.slice(7), SECRET);
      const permissions =
        payload.permissions ?? ROLE_PERMISSIONS[payload.role] ?? [];
      if (!permissions.includes(permission)) {
        return res.status(403).json({ error: `Permission '${permission}' required` });
      }
      req.user = { ...payload, permissions };
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = { createToken, requirePermission, ROLE_PERMISSIONS };
