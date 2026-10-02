const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to access this resource');
      error.statusCode = 403;
      throw error;
    }

    next();
  };
};

module.exports = authorize;
