const passport = require('passport');

const jwtStrategy = require('./strategies/jwt.strategy');

passport.use(jwtStrategy);
