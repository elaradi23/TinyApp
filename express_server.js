//
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//
var PORT = 8080;
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Page that desplays the urls in our database:
app.get("/urls/", (req, res) => {
  let templateVars = {urls: urlDatabase };
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
  res.render("urls_new");
});

// sends a POST request to store the URL with a generated key in our database:
app.post("/urls/new", (req, res) => {
  urlDatabase[generateRandomString()] = req.body["longURL"];
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
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(0, 6);
}

