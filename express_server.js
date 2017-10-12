var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var value = req.body["longURL"];
  var key = generateRandomString();
  urlDatabase[key] = value;
  res.redirect(`/urls/${key}`);         
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var fullURL = urlDatabase[req.params.id];
  let templateVars = { shortURL: req.params.id, fullURL: fullURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  var newLongURL = req.body["longURL"];
  urlDatabase[req.params.id] = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  var username = req.body["username"];
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let newUserRandomID = generateRandomString();
  let newEmail = req.body["email"];
  let newPassword = req.body["password"];
  users[newUserRandomID] = {"id": newUserRandomID, "email": newEmail, "password": newPassword };
  res.cookie("user_id", newUserRandomID);
  console.log(users);
  res.redirect("/urls");

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
// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });