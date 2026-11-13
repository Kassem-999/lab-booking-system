const { pool } = require('../config/db');

exports.getMetrics = async (_req, res) => {
  const [[equipment], [activeBookings], [pendingApprovals], [users]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS value FROM equipment'),
    pool.query("SELECT COUNT(*) AS value FROM reservations WHERE status = 'approved'"),
    pool.query("SELECT COUNT(*) AS value FROM reservations WHERE status = 'pending'"),
    pool.query('SELECT COUNT(*) AS value FROM users')
  ]);
  res.json({
    success: true,
    data: {
      equipment: Number(equipment[0].value),
      activeBookings: Number(activeBookings[0].value),
      pendingApprovals: Number(pendingApprovals[0].value),
      users: Number(users[0].value)
    }
  });
};
