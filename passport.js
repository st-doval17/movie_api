const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },

    async (username, password, callback) => {
      console.log(username + " " + password);
      try {
        const user = await Users.findOne({ Username: username });

        if (!user) {
          console.log("Incorrect Username");
          return callback(null, false, { message: "Incorrect Username" });
        }

        if (!user.validatePassword(password) === false) {
          console.log("Incorrect Password");
          return callback(null, false, { message: "Incorrect Password" });
        }

        console.log("finished");
        return callback(null, user);
      } catch (error) {
        console.log(error);
        return callback(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
