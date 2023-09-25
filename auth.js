const jwtSecret = 'your_jwt_secret'; // The secret key used in the JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Include the local passport file

/**
 * Generates a JWT token for a user.
 * @param {object} user - The user object to encode in the JWT.
 * @returns {string} JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username encoded in the JWT
    expiresIn: '7d', // Token will expire in 7 days
    algorithm: 'HS256', // The algorithm used to sign the JWT
  });
};

/**
 * Handles the POST request for user login.
 * @param {object} router - The Express router.
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log(error);
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
