// src/api/models/index.js
const { sequelize } = require('../../config/database');
const NotificationLog = require('./NotificationLog.model');

const db = {
    sequelize,
    NotificationLog
};

module.exports = db;