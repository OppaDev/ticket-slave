// src/api/middleware/auth.middleware.js

/**
 * Middleware de autenticación simulado.
 * En una aplicación real, este middleware validaría un token JWT,
 * buscaría el usuario en la base de datos y lo adjuntaría al objeto `req`.
 */
const authenticate = (req, res, next) => {
    // Extrae el userId de la cabecera enviada por Kong
    const userId = req.header('X-User-Id');
    if (!userId) {
        return res.status(401).json({ message: 'No autorizado: userId no presente' });
    }
    req.user = {
        id: parseInt(userId, 10),
        // ... otros datos del usuario si se agregan más claims
    };
    next();
};

module.exports = {
    authenticate
};