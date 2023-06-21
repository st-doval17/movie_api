//express require
const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");

const app = express();
const uuid = require("uuid");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// a log.txt file is created in root directory
const accessLogStream = fs.createWriteStream(__dirname + "/log.txt", {
  flags: "a",
});
app.use(morgan("tiny", { stream: accessLogStream }));

//to serve documentation.html from public folder
app.use(express.static("public"));

/* -- Start of Endpoints --*/
// root directory
app.get("/", (req, res) => {
  res.send("Welcome to myFlix, a movie app.");
});

// GET route request
app.get("/movies", (req, res) => res.status(200).json(movies));
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

// POST route request
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

app.post("/users/:id/:title", (req, res) => {
  const { id, title } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies.push(title);
    res.status(200).send(`${title} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such movie");
  }
});

// PUT route request
app.put("/users/:username", (req, res) => {
  res.send("Successful. Your username has been updated");
});
app.post("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);
  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

// DELETE route request
app.delete("/users/:id/:title", (req, res) => {
  const { id, title } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== title
    );
    res.status(200).send(`${title} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

//error message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//users
let users = [
  {
    id: 1,
    name: "Andie",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Sam",
    favoriteMovies: "Breakfast at Tiffanys",
  },
  {
    id: 3,
    name: "Alex",
    favoriteMovies: "City Lights",
  },
];

// movie: Title, Director, Genre, Description, imageURL
let movies = [
  {
    title: "Breakfast at Tiffanys",
    director: {
      name: "Blake Edwards",
      bio: " An American film director, producer, screenwriter, and actor. Edwards began his career in the 1940s as an actor, but he soon began writing screenplays and radio scripts before turning to producing and directing in television and films.",
      birthYear: "1922",
      deathYear: "2010",
    },
    year: "1961",
    genre: {
      name: "romance",
      description:
        "Romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters. Typically their journey through dating, courtship or marriage is featured. These films make the search for romantic love the main plot focus.",
    },
    description:
      "A young New York socialite becomes interested in a young man who has moved into her apartment building, but her past threatens to get in the way.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/4/4b/Breakfast_at_Tiffany%27s_%281961_poster%29.jpg",
  },
  {
    title: "Gone with the Wind",
    director: {
      name: "Victor Fleming",
      bio: "An American film director, cinematographer, and producer.",
      birthYear: "1889",
      deathYear: "1949",
    },
    year: "1939",
    genre: {
      name: "drama",
      description:
        "A category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    description:
      "A sheltered and manipulative Southern belle and a roguish profiteer face off in a turbulent romance as the society around them crumbles with the end of slavery and is rebuilt during the Civil War and Reconstruction periods.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/2/27/Poster_-_Gone_With_the_Wind_01.jpg",
  },
  {
    title: "City Lights",
    director: {
      name: "Charles Chaplin",
      bio: "An English comic actor, filmmaker, and composer who rose to fame in the era of silent film. He became a worldwide icon through his screen persona, the Tramp, and is considered one of the film industry's most important figures",
      birthYear: "1889",
      deathYear: "1977",
    },
    year: "1931",
    genre: {
      name: "comedy",
      description:
        "A category of film which emphasizes on humor. These films are designed to make the audience laugh in amusement.",
    },
    description:
      "With the aid of a wealthy erratic tippler, a dewy-eyed tramp who has fallen in love with a sightless flower girl accumulates money to be able to help her medically.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/0/09/City_Lights_%281931_theatrical_poster_-_retouched%29.jpg",
  },
  {
    title: "Rear Window",
    director: {
      name: "Alfred Hitchcock",
      bio: "An English filmmaker. He is widely regarded as one of the most influential figures in the history of cinema.[1] In a career spanning six decades, he directed over 50 feature films,[a] many of which are still widely watched and studied today",
      birthYear: "1899",
      deathYear: "1980",
    },
    year: "1954",
    genre: {
      name: "thriller",
      description: "",
    },
    description:
      "A photographer in a wheelchair spies on his neighbors from his Greenwich Village courtyard apartment window, and becomes convinced one of them has committed murder, despite the skepticism of his fashion-model girlfriend.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/b/b3/Rear_Window_film_poster.png",
  },
  {
    title: "A Star Is Born",
    director: {
      name: "George Cukor",
      bio: "an American film director and producer.[2] He mainly concentrated on comedies and literary adaptations",
      birthYear: "1899",
      deathYear: "1983",
    },
    year: "1954",
    genre: {
      name: "musical",
      description:
        "A film genre in which songs by the characters are interwoven into the narrative, sometimes accompanied by dancing. The songs usually advance the plot or develop the film's characters, but in some cases, they serve merely as breaks in the storyline, often as elaborate production numbers.",
    },
    description:
      "A film star helps a young singer and actress find fame, even as age and alcoholism send his own career on a downward spiral.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/c/c2/A_Star_Is_Born_%281954_film_poster%29.jpg",
  },
  {
    title: "Casablanca",
    director: {
      name: "Michael Curtiz",
      bio: "A Hungarian-American film director, recognized as one of the most prolific directors in history. He directed classic films from the silent era and numerous others during Hollywood's Golden Age, when the studio system was prevalent.",
      birthYear: "1886",
      deathYear: "1962",
    },
    year: "1942",
    genre: {
      name: "drama",
      description:
        "A category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    description:
      "A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis in French Morocco.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/b/b3/CasablancaPoster-Gold.jpg",
  },
  {
    title: "The Wizard of Oz",
    director: {
      name: "Victor Fleming",
      bio: "An American film director, cinematographer, and producer.",
      birthYear: "1889",
      deathYear: "1949",
    },
    year: "1939",
    genre: {
      name: "family",
      description:
        "A film genre that are made for a wider appeal with a general audience in mind. Films come in several major genres like realism, fantasy, adventure, war, musicals, comedy, and literary adaptations.",
    },
    description:
      "Young Dorothy Gale and her dog Toto are swept away by a tornado from their Kansas farm to the magical Land of Oz, and embark on a quest with three new friends to see the Wizard, who can return her to her home and fulfill the others wishes.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/6/69/Wizard_of_oz_movie_poster.jpg",
  },
  {
    title: "Mildred Pierce",
    director: {
      name: "Michael Curtiz",
      bio: "A Hungarian-American film director, recognized as one of the most prolific directors in history. He directed classic films from the silent era and numerous others during Hollywood's Golden Age, when the studio system was prevalent.",
      birthYear: "1886",
      deathYear: "1962",
    },
    year: "1945",
    genre: {
      name: "crime",
      description:
        "A film genre inspired by and analogous to the crime fiction literary genre. Films of this genre generally involve various aspects of crime and its detection.",
    },
    description:
      "A hard-working mother inches towards disaster as she divorces her husband and starts a successful restaurant business to support her spoiled daughter.",
    imageURL:
      "upload.wikimedia.org/wikipedia/commons/d/dc/Mildred_Pierce_%281945_poster%29.jpg",
  },
  {
    title: "An Affair to Remember",
    director: {
      name: "Leo McCarey",
      bio: " an American film director, screenwriter, and producer. He was involved in nearly 200 films",
      birthYear: "1989",
      deathYear: "1969",
    },
    year: "1957",
    genre: {
      name: "romance",
      description:
        "Romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters. Typically their journey through dating, courtship or marriage is featured. These films make the search for romantic love the main plot focus.",
    },
    description:
      "A couple falls in love and agrees to meet in six months at the Empire State Building - but will it happen?",
    imageURL: "upload.wikimedia.org/wikipedia/en/1/16/AffairtoRemember.jpg",
  },
  {
    title: "The Misfits",
    director: {
      name: "John Huston",
      bio: "An American film director, screenwriter and actor. He wrote the screenplays for most of the 37 feature films he directed, many of which are today considered classics",
      birthYear: "1906",
      deathYear: "1987",
    },
    year: "1961",
    genre: {
      name: "drama",
      description:
        "A category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    description:
      "A divorcée falls for an over-the-hill cowboy who is struggling to maintain his romantically independent lifestyle.",
    imageURL: "upload.wikimedia.org/wikipedia/en/4/4b/Misfits3423.jpg",
  },
];

//listen for request
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
