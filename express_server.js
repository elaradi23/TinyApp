//
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//
var PORT = 8080;
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Page that desplays the urls in our database:
app.get("/urls/", (req, res) => {
  // console.log('Cookies: ', req.cookies);
  // console.log('Signed Cookies: ', req.signedCookies);
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

// redirects to a page using shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log();
  res.redirect(longURL);
});

// Page to take a new url
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// sends a POST request to store the URL with a generated key in our database:
app.post("/urls/new", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body["longURL"];
  // res.cookie(key, req.body["longURL"]);
  res.redirect("/urls");
});

// Sends a GET request to display shortURL and longURL for update
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {shortURL, longURL};
  res.render("urls_show", templateVars);
});

// Sends a POST request to update a given shortURL with a new longURL to our database:
app.post("/urls/:shortURL/update", (req, res) =>{
  urlDatabase[req.params.shortURL] = req.body["longURL"];
  res.redirect("/urls");
});

// Sends a POST request to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Sends a POST request to register username
app.post('/login', (req, res) => {
  res.cookie('username', req.body['username']);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(0, 6);
}

