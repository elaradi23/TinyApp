var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// app.use(function (req, res, next) {
//   console.log(req.method + ": " +req.path);
//   console.log(req.cookies);
//   console.log(users);
//   console.log('###########################');
//   next();
// })

var PORT = 8080;
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

//__________________________________________________________

// Page that desplays the urls in our database:
app.get("/urls/", (req, res) => {
  let templateVars = {urls: urlDatabase, users, user_id: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

// Redirects to a page using shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Page to take a new url
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, users, user_id: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

// Sends a POST request to store the URL with a generated key in our database:
app.post("/urls/new", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = req.body["longURL"];
  // res.cookie(key, req.body["longURL"]);
  res.redirect("/urls");
});

// Sends a GET request to display shortURL and longURL for update
app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = {shortURL, longURL, users, user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

//__________________________________________________________

//-- Heandles redirecting to Register and Log in pages by header

app.post('/headToRegister', (req, res) => {
  res.redirect('/register');
});

app.post('/headTologin', (req, res) => {
  res.redirect('/login');
});

//__________________________________________________________


//-- Handles user login and logout:

app.get('/login', (req, res) => {
  let templateVars = {urls: urlDatabase, users, user_id: req.cookies["user_id"]};
  res.render('urls_login', templateVars);
});

// Sends a POST request to register user
app.post('/login', (req, res) => {
  let user_email = req.body['email'];

  if(!userExists(user_email)){
    res.status(403).send("Forbidden: You don't have permission to access / on this server");
  }
  else {
    let user_ID = returnUserID('email', user_email);
    let user_password = req.body['password']

    if(users[user_ID].password !== user_password){
      res.status(403).send("The password you’ve entered is incorrect");
    } else {
      res.cookie('user_id', user_ID);
      res.redirect("/urls");
    }
  }
});

// Sends a POST request to logout usern
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//__________________________________________________________

//-- Handles user regesitration:

// Sends a GET request to page
app.get('/register', (req,res) =>{
  res.render("urls_register");
});

// Handles a POST request to add new user info:
app.post('/register', (req, res) => {
  var {email, password} = req.body;

  if(!email || !password){
    res.status(400).send('400: empty email or password')
  }
  else if(userExists(email)){
    res.status(400).send('400: email already exists');
  }
  else {
    var randomID = generateRandomString();
    users[randomID] = {id: randomID, email, password};
    // console.log(users);

    res.redirect("/urls");
  }
});

//__________________________________________________________

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(0, 6);
}

function userExists(email){
  for(var user in users){
    if(users[user]['email'] === email){
      return true;
    }
  }
  return false;
}

function returnUserID(key, value){
  var userID = '';
  for(var user in users){
    if(users[user][key] === value){
      userID = user;
    }
  }
  return userID;
}

