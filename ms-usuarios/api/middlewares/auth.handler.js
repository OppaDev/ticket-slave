const boom = require('@hapi/boom');
const { config } = require('../config/config');

function checkApiKey(req, res, next) {
  const apiKey = req.headers['api'];
  if (apiKey === config.apiKey) {
    next();
  } else {
    next(boom.unauthorized('API key incorrecta'));
  }
}

function checkAdminRole(req, res, next) {
  const { role } = req.user;
  if (role === 'admin') {
    next();
  } else {
    next(boom.unauthorized('Rol no autorizado'));
  }
}

function checkRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(boom.unauthorized('Rol no autorizado'));
    } else {
      next();
    }
  }
}

function checkPermissions(...permissions) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.every(permission => userPermissions.includes(permission));
    if (!hasPermission) {
      next(boom.unauthorized('Permiso no autorizado'));
    } else {
      next();
    }
  };
}

function checkRole(role) {
  return (req, res, next) => {
    console.log(req.user);
    const userRole = req.user.role;
    if (userRole !== role) {
      next(boom.unauthorized('Rol no autorizado'));
    } else {
      next();
    }
  };
}

module.exports = { checkApiKey, checkAdminRole, checkRoles, checkPermissions, checkRole };
