const { Strategy, ExtractJwt } = require('passport-jwt');
const { config } = require('../../../config/config');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
}

const jwtStrategy = new Strategy(options, (payload, done)=>{
    return done(null, payload); //se agrega el payload a la request como req.user
})

module.exports = jwtStrategy;
