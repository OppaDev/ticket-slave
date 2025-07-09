// src/api/middleware/auth.middleware.js

/**
 * Middleware de autenticación simulado.
 * En una aplicación real, este middleware validaría un token JWT,
 * buscaría el usuario en la base de datos y lo adjuntaría al objeto `req`.
 */
const authenticate = (req, res, next) => {
    // Para fines de desarrollo, simulamos un usuario autenticado.
    // Asumimos que el token nos da un ID de usuario.
    req.user = {
        id: 1, // ID del usuario simulado
        // ... otros datos del usuario (rol, etc.)
    };

    // En un caso real, si el token no es válido:
    // return res.status(401).json({ message: 'No autorizado' });

    next();
};

module.exports = {
    authenticate
};