module.exports = {
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
        "!src/config/database.js"
    ],
    testMatch: [
        "**/__tests__/**/*.js",
        "**/?(*.)+(spec|test).js"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"]
};