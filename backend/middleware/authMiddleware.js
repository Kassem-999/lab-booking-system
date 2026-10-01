const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Middleware للتحقق من صحة الـ Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'المستعمل غير موجود' });
      }

      next(); // عدّي للعملية اللي بعدها
    } catch (error) {
      return res.status(401).json({ message: 'الـ Token غير صالح أو انتهت صلاحيته' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مسموح بالدخول، لا يوجد Token' });
  }
};

// 2. Middleware للتحقق من الأدوار (Roles) كيما student أو admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `دور '${req.user.role}' لا يملك الصلاحية للوصول إلى هذه الصفحة`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };