// src/api/models/NotificationLog.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class NotificationLog extends Model {}

NotificationLog.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    channel: {
        type: DataTypes.ENUM('EMAIL', 'PUSH', 'SMS'),
        allowNull: false,
    },
    recipient: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    template: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('SENT', 'FAILED', 'PENDING'),
        allowNull: false,
    },
    content: {
        type: DataTypes.JSONB, // Contenido del mensaje enviado
        allowNull: true,
    },
    failReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'fail_reason',
    }
}, {
    sequelize,
    modelName: 'NotificationLog',
    tableName: 'notification_logs',
    timestamps: true,
    underscored: true,
});

module.exports = NotificationLog;