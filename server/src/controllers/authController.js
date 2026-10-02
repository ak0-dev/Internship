const asyncHandler = require('../utils/asyncHandler');
const { registerUser, loginUser, getCurrentUser } = require('../services/authService');

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token } = await registerUser({ name, email, password });

  setAuthCookie(res, token);

  res.status(201).json({
    message: 'User registered successfully',
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginUser({ email, password });

  setAuthCookie(res, token);

  res.status(200).json({
    message: 'Login successful',
    user,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');

  res.status(200).json({
    message: 'Logged out successfully',
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  res.status(200).json({
    user,
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
