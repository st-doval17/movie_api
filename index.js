/**
 * Express require
 * various properties and functions specific to my application, including
 * routing, authentication, database connections, and more.
 *
 *
 * @typedef {Object} Express - Represents the Express application instance.
 * @property {function} cors - Configures Cross-Origin Resource Sharing (CORS) settings.
 * @property {function} authenticate - Passport.js middleware for user authentication.
 * @property {function} passport - Initializes Passport.js for authentication strategies.
 * @property {function} bodyParser - Parses incoming request bodies into JSON and URL-encoded data.
 * @property {function} uuid - Generates unique identifiers (UUIDs).
 * @property {function} fs - File system module for working with files.
 * @property {function} auth - Middleware for user authentication and authorization.
 * @property {function} passport - Initializes Passport.js for authentication strategies.
 * @property {function} morgan - HTTP request logger middleware.
 * @property {function} express - The Express.js library.
 */

const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
const uuid = require('uuid');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

/* mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// a log.txt file is created in root directory
const accessLogStream = fs.createWriteStream(__dirname + '/log.txt', {
  flags: 'a',
});
app.use(morgan('tiny', { stream: accessLogStream }));

//to serve documentation.html from public folder
app.use(express.static('public'));

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'https://myflix-gs.netlify.app',
  'http://localhost:4200',
  'https://st-doval17.github.io/angular-flix',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn't found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

//importing auth.js, and is after bodyParser middleware function
let auth = require('./auth')(app);

//import passport.js and is after importing auth.js
const passport = require('passport');
require('./passport');

/**
 * Root directory.
 * @route GET /
 * @returns {string} Welcome message.
 */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix, a movie app.');
});

/**
 * Get a list of all movies.
 * @route GET /movies
 * @returns {Array} List of movies.
 * @throws {Error} 500 - Server error.
 */

/**
 * Movie document.
 * @typedef {Object} Movie - Represents a movie.
 * @property {string} Title - The title of the movie.
 * @property {string} Genre - The genre of the movie.
 * @property {string} Director - The director of the movie.
 */

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a movie by title.
 * @route GET /movies/:Title
 * @param {string} Title - The title of the movie.
 * @returns {object} Movie information.
 * @throws {Error} 500 - Server error.
 */
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get movies by genre name.
 * @route GET /movies/genre/:genreName
 * @param {string} genreName - The name of the genre.
 * @returns {object} Genre information.
 * @throws {Error} 500 - Server error.
 */
app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        if (movie) return res.json(movie.Genre);
        else
          res
            .status(500)
            .send('Error: ' + req.params.genreName + ' is not found');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get movies by director name.
 * @route GET /movies/director/:directorName
 * @param {string} directorName - The name of the director.
 * @returns {object} Director information.
 * @throws {Error} 500 - Server error.
 */
app.get(
  '/movies/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a list of all users.
 * @route GET /users
 * @returns {Array} List of users.
 * @throws {Error} 500 - Server error.
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get favorite movies by user name.
 * @route GET /favoriteMovies/:userName
 * @param {string} userName - The username of the user.
 * @returns {Array} List of favorite movies.
 * @throws {Error} 500 - Server error.
 */
app.get(
  '/favoriteMovies/:userName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const userName = req.params.userName;

    Users.findOne({ Username: userName }, 'FavoriteMovies')
      .then((favoriteMovies) => {
        res.send(favoriteMovies.FavoriteMovies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * User document.
 * @typedef {Object} User - Represents a user of the application.
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The date of birth of the user.
 * @property {string[]} FavoriteMovies - An array of movie IDs representing the user's favorite movies.
 */

// POST route request -- allows users to register
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * Add a movie to the user's list of favorite movies.
 * @route POST /users/:userName/movies/:MovieID
 * @param {string} userName - The username of the user.
 * @param {string} MovieID - The ID of the movie to add to favorites.
 * @returns {Array} Updated list of favorite movies.
 * @throws {Error} 500 - Server error.
 */
app.post(
  '/users/:userName/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.userName },
        {
          $addToSet: { FavoriteMovies: req.params.MovieID },
        },
        { new: true }
      );
      res.json(updatedUser.FavoriteMovies);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

/**
 * Update user information.
 * @route PUT /users/:userName
 * @param {string} userName - The username of the user.
 * @param {string} Email - The updated email address.
 * @param {string} Birthday - The updated date of birth.
 * @returns {object} Updated user information.
 * @throws {Error} 500 - Server error.
 */
app.put(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.userName },
        {
          $set: {
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        { new: true }
      );
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

/**
 * Remove a movie from the user's list of favorite movies.
 * @route DELETE /users/:userName/movies/:MovieID
 * @param {string} userName - The username of the user.
 * @param {string} MovieID - The ID of the movie to remove from favorites.
 * @returns {Array} Updated list of favorite movies.
 * @throws {Error} 500 - Server error.
 */
app.delete(
  '/users/:userName/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.userName },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser.FavoriteMovies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Delete a user.
 * @route DELETE /users/:userName
 * @param {string} userName - The username of the user to delete.
 * @returns {string} Success or error message.
 * @throws {Error} 500 - Server error.
 */
app.delete(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.userName })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.userName + ' was not found');
        } else {
          res.status(200).send(req.params.userName + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//error message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
