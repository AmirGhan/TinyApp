var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// var cookieParser = require('cookie-parser');
// app.use(cookieParser());
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

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
}

var globalErrMsg = ""

app.get("/", (req, res) => {
  res.render("home");
});


function urlsForUser(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLs[key] = urlDatabase[key] 
    }
  }
  return userURLs
}



app.get("/urls", (req, res) => {
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;

  if (!userID) {
    res.redirect("/")
  }

  let templateVars = { urls: urlsForUser(userID), user: users[userID], errorMsg: globalErrMsg };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  //let userID = req.cookies["user_id"]
  let userID = req.session.user_id;
  urlDatabase[shortURL] = {"shortURL": shortURL, "longURL": longURL, "userID": userID}
  res.redirect("/urls");         
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  let templateVars = { user: users[userID] };

  if (!userID) {
    res.redirect("/")
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let fullURL = urlDatabase[req.params.id].longURL;
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  let templateVars = { shortURL: req.params.id, fullURL: fullURL, user: users[userID]  };

  if (!userID) {
  res.redirect("/")
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let newLongURL = req.body["longURL"];
  let dbUserID = urlDatabase[req.params.id].userID;
  // let currentUser = req.cookies["user_id"];
  let currentUser = req.session.user_id;

  if (dbUserID === currentUser) {
    urlDatabase[req.params.id].longURL = newLongURL;
    globalErrMsg = "";
    res.redirect("/urls");
    } else {
        globalErrMsg = "You are not authorized to perform this action since you are not the owner of this URL.";
        res.redirect("/urls")
      };
});

app.post("/urls/:id/delete", (req, res) => {
  let dbUserID = urlDatabase[req.params.id].userID;
  //let currentUser = req.cookies["user_id"];
  let currentUser = req.session.user_id;

    if (dbUserID === currentUser) {
    delete urlDatabase[req.params.id];
    globalErrMsg = "";
    res.redirect("/urls");
    } else {
        globalErrMsg = "You are not authorized to perform this action since you are not the owner of this URL.";
        res.redirect("/urls");
      };
});


app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session.user_id = null;
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  let templateVars = { user: users[userID] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let newUserRandomID = generateRandomString();
  let newEmail = req.body["email"];
  let newPassword = req.body["password"];
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (newEmail == "" || newPassword == "") {
    res.status(400).end("Make sure both email and password are entered.")
  } 

  for (let user_id in users) {
    if (users[user_id].email == newEmail) {
      res.status(400).end("User already exists.")
    }
  }
  
  users[newUserRandomID] = {"id": newUserRandomID, "email": newEmail, "password": hashedPassword };
  //res.cookie("user_id", newUserRandomID);
  req.session.user_id = newUserRandomID
  res.redirect("/urls");
});

app.get("/login", (req, res) => {

  res.render("login")
});

app.post("/login", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];

  if (email == "" || password == "") {
    res.status(400).end("Make sure both email and password are entered.")
  } 

  for (let user_id in users) {
    if (users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)) {
      //res.cookie("user_id", user_id);
      req.session.user_id = user_id;
      res.redirect("/urls");
    }
  };
  res.status(403).end("You have the wrong credentials.");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// found on : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// npm randomstring library : https://www.npmjs.com/package/randomstring
function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomString;
}

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });