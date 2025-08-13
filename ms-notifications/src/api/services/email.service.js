const nodemailer = require('nodemailer');
const config = require('../../config/config');
class EmailService {
    constructor() {
        // Creamos el "transporter" una sola vez al instanciar el servicio
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.auth.user,
                pass: config.smtp.auth.pass,
            },
        });
        
        // Verificamos la conexión SMTP al iniciar (opcional pero recomendado)
        this.transporter.verify()
            .then(() => console.log('✅ SMTP transporter listo para enviar correos.'))
            .catch(error => console.error('❌ Error al configurar el transporter SMTP:', error));
    }

    /**
     * Envía un correo electrónico.
     * @param {string} to - El destinatario del correo.
     * @param {string} subject - El asunto del correo.
     * @param {string} htmlContent - El contenido HTML del correo.
     * @returns {Promise<object>} - Información sobre el mensaje enviado.
     */
    async send(to, subject, htmlContent) {
        if (!config.smtp.auth.user) {
            console.error('El servicio de email no está configurado. Revisa las variables de entorno SMTP.');
            // Lanzamos un error para que el servicio que lo llama sepa que falló.
            throw new Error('Servicio de email no configurado.');
        }

        const mailOptions = {
            from: config.emailFrom, // Remitente definido en .env
            to,
            subject,
            html: htmlContent,
        };

        try {
            console.log(`Enviando email a: ${to} con asunto: ${subject}`);
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email enviado exitosamente. Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`Error al enviar correo a ${to}:`, error);
            // Re-lanzamos el error para que sea capturado por notification.service.js
            throw error;
        }
    }
}

module.exports = new EmailService();