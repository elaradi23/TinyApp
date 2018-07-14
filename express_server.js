const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key'],
}))

var PORT = 3000;
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    date: "2000-1-1"
  },
  "9sm5xK": {
    shortURL: "b2xVn2",
    longURL: "http://www.google.com",
    userID: "user2RandomID",
    date: "2000-1-1"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

//__________________________________________________________

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if(!userExists(userID)){
    req.session = null;
    res.redirect('/login');
  } else {
    res.redirect("/urls/");
  }
});

// Page that desplays the urls in our database:
app.get("/urls/", (req, res) => {
  const userID = req.session.user_id;
  if(!userExists(userID)){
    res.status(400).send("Forbidden: You don't have permission to access");
  } else {
    let templateVars = {urls: urlDatabase, user: users[userID], users};
    res.render("urls_index", templateVars);
  }
});

// Page to take a new url
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login/");
  } else {
    let templateVars = {urls: urlDatabase, user: users[userID], users, user_id: userID};
    res.render("urls_new", templateVars);
  }
});

// Sends a POST request to store the URL object with a generated key in our database:
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  shortURL = generateRandomString();
  longURL = req.body["longURL"];

  var today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

  urlDatabase[shortURL] = {shortURL, longURL, userID, date};
  res.redirect("/urls/" + shortURL);
});

// Sends a GET request to display shortURL and longURL for update
app.get("/urls/:shortURL/", (req, res) => {
  const userID = req.session.user_id;
  if(!userExists(userID)){
    req.session = null;
    res.redirect('/login').send('400');
  } else if(urlDatabase[req.params.shortURL]["userID"] == userID){
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL].longURL;
    let dateCreated = urlDatabase[shortURL].date;
    let templateVars = {shortURL,  longURL, dateCreated, users, user: users[userID], user_id: userID};
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Forbidden: You don't have permission to access");
  }
});

app.get("/u/:shortURL/", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  if(!longURL){
    res.status(404).send("")
  } else {
    res.redirect(longURL);
  }
});

// Sends a POST request to update a given shortURL with a new longURL to our database:
app.post("/urls/:shortURL", (req, res) =>{
  console.log(req.body["longURL"]);
  urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"];
  res.redirect("/urls");
});

// Sends a POST request to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//-- Handles user login and logout:

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if(!userExists(userID)){
    let templateVars = {urls: urlDatabase, user: users[userID], users}
    res.render('urls_login', templateVars);
  } else {
    res.redirect("/urls");
  }
});

// Sends a POST request to register user
app.post('/login', (req, res) => {
  let user_email = req.body['email'];

  if(!emailExists(user_email)){
    res.status(403).send("Forbidden: You don't have permission to access / on this server");
  }
  else {
    let user_ID = returnUserID('email', user_email);
    let user_password = req.body['password'];

    if(!bcrypt.compareSync(user_password, users[user_ID].password)){
      res.status(403).send("The password you’ve entered is incorrect");
    } else {
      req.session.user_id = user_ID;
      res.redirect("/urls");
    }
  }
});

// Sends a POST request to logout usern
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//__________________________________________________________

//-- Handles user regesitration:

// Sends a GET request to page
app.get('/register', (req,res) =>{
  const userID = req.session.user_id;
  if (!userID) {
    let templateVars = {urls: urlDatabase, user: users[userID], users}
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }

  // const userID = req.session.user_id;
  // let templateVars = {urls: urlDatabase, user: users[userID], users}
  // res.render("urls_register", templateVars);
});

// Handles a POST request to add new user info:
app.post('/register', (req, res) => {
  var {email, password} = req.body;

  if(!email || !password){
    res.status(400).send('400: empty email or password')
  }
  else if(emailExists(email)){
    res.status(400).send('400: email already exists');
  }
  else {
    var randomID = generateRandomString();
    req.session.user_id = randomID;
    let hashedPassword = bcrypt.hashSync(password,10);

    users[randomID] = {id: randomID, email, password: hashedPassword};
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

function userExists(_user){
  for(var user in users){
    if(user === _user){
      return true;
    }
  }
  return false;
}

function emailExists(email){
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

function urlsForUser(id){
  if(!id){
    return;
  }
}

