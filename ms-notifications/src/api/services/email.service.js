// src/api/services/email.service.js

/**
 * Servicio simulado para enviar correos electrónicos.
 * En una implementación real, aquí se usaría un SDK como @sendgrid/mail o nodemailer.
 */
class EmailService {
    async send(to, subject, htmlContent) {
        console.log('--- SIMULANDO ENVÍO DE EMAIL ---');
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log('---------------------------------');

        // Simula una operación asíncrona que siempre tiene éxito.
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, messageId: `mock_email_${Date.now()}` };
    }
}

module.exports = new EmailService();