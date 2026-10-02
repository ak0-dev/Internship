const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

const getRecruiterDashboard = asyncHandler(async (req, res) => {
  const statistics = await dashboardService.getRecruiterDashboard(req.user._id);
  res.status(200).json({ statistics });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const statistics = await dashboardService.getAdminDashboard();
  res.status(200).json({ statistics });
});

module.exports = {
  getRecruiterDashboard,
  getAdminDashboard,
};
