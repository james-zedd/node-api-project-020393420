const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResonse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // token is in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // token is in cookie
    // token = req.cookies.token;
    console.log('token is in cookie');
  }

  // check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('decoded', decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route.`, 403));
    }
    next();
  }
}