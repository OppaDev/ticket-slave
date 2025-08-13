// src/api/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/config');

/**
 * Middleware de autenticación.
 * Valida un token JWT,
 * y adjunta el payload al objeto `req.user`.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No autorizado: token no presente' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload; // El payload debe contener el id y otros claims
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = {
    authenticate
};