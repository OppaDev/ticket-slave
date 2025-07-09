const { Strategy } = require('passport-local');
const AuthService = require('../../../services/auth.service');

const service = new AuthService();

const localStrategy = new Strategy({usernameField: 'email'}, async (email, password, done)=>{
    try {
        const user = await service.getUser(email, password);
        done(null, user);
    } catch (error) {
        return done(error, false);
    }
});

module.exports = localStrategy;
