//==============================================================================================================================
// MIDDLEWARES
//==============================================================================================================================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

let globalErrMsg = "";

//==============================================================================================================================
// DATABASES
//==============================================================================================================================

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$Z/NkbWBX/KOk4O.Tftjb/el/4g1lQ5PZRukUA5kn9DLK3rhwbKld6"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$due6Y75r/VD/MBdnpKzOxe7R0AZhB4vxPmMNSbYpEozwTffR3MxGO"
  }
};

//==============================================================================================================================
// GETs
//==============================================================================================================================

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// List of owned URLs
app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.redirect("/");
    return;
  }
  let templateVars = { urls: urlsForUser(userID), user: users[userID], errorMsg: globalErrMsg };
  res.render("urls_index", templateVars);
});

// Create a new short link
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = { user: users[userID] };
  if (!userID) {
    res.redirect("/");
    return;
  }
  res.render("urls_new", templateVars);
});

// Registration
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let templateVars = {user: users[userID]};
  res.render("registration", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Updating a long URL
app.get("/urls/:id", (req, res) => {
  let fullURL = urlDatabase[req.params.id].longURL;
  let userID = req.session.user_id;
  let templateVars = {shortURL: req.params.id, fullURL: fullURL, user: users[userID]};
  if (!userID) {
  res.redirect("/");
  return;
  }
  res.render("urls_show", templateVars);
});

// Redirect to the actual website
app.get("/u/:shortURL", (req, res) => {
  let fullURL = urlDatabase[req.params.shortURL].longURL;
  let userID = req.session.user_id;
  if (!userID) {
  res.redirect("/");
  return;
  }
  res.redirect(fullURL);
});

//==============================================================================================================================
// POSTs
//==============================================================================================================================

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.session.user_id;
  urlDatabase[shortURL] = {"shortURL": shortURL, "longURL": longURL, "userID": userID};
  res.redirect("/urls");         
});


app.post("/urls/:id", (req, res) => {
  let newLongURL = req.body.longURL;
  let dbUserID = urlDatabase[req.params.id].userID;
  let currentUser = req.session.user_id;
  if (dbUserID === currentUser) {
    urlDatabase[req.params.id].longURL = newLongURL;
    globalErrMsg = "";
    res.redirect("/urls");
    } else {
        globalErrMsg = "You are not authorized to perform this action since you are not the owner of this URL.";
        res.redirect("/urls");
      }
});


app.post("/urls/:id/delete", (req, res) => {
  let dbUserID = urlDatabase[req.params.id].userID;
  let currentUser = req.session.user_id;
  if (dbUserID === currentUser) {
    delete urlDatabase[req.params.id];
    globalErrMsg = "";
    res.redirect("/urls");
    } else {
        globalErrMsg = "You are not authorized to perform this action since you are not the owner of this URL.";
        res.redirect("/urls");
      }
});


app.post("/register", (req, res) => {
  let newUserRandomID = generateRandomString();
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  if (newEmail == "" || newPassword == "") {
    res.status(400).end("Make sure both email and password are entered.");
  }
  for (let user_id in users) {
    if (users[user_id].email == newEmail) {
      res.status(400).end("User already exists.");
      return;
    }
  }
  users[newUserRandomID] = {"id": newUserRandomID, "email": newEmail, "password": hashedPassword};
  req.session.user_id = newUserRandomID;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (email == "" || password == "") {
    res.status(400).end("Make sure both email and password are entered.");
  }

  for (let user_id in users) {
    if (users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)) {
      req.session.user_id = user_id;
      res.redirect("/urls");
    }
  }
  res.status(403).end("You have the wrong credentials.");
});


app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//==============================================================================================================================
// FUNCTIONS
//==============================================================================================================================

// found generateRandomString from : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// hint for future : npm randomstring library : https://www.npmjs.com/package/randomstring
function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}

function urlsForUser(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
}