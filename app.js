require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); // level 2 using secret key
const md5 = require("md5"); // level 3 - hashing

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// secret key is in .env file to prevent someone from accessing it from github or so
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); // encrypt only password, not the email

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  res.render("secrets");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password), // store password in hash format
  });

  // save() => mongoose enrypt
  newUser.save(function (err) {
    if (err) console.log(err);
    else res.render("secrets");
  });
});

app.post("/login", (req, res) => {
  const email = req.body.username;
  const password = md5(req.body.password); // hashing

  // find() => mongoose decrpyt
  User.findOne({ email: email }, function (err, foundUser) {
    if (err) console.log(err);
    else {
      if (foundUser) {
        if (foundUser.password === password) res.render("secrets");
      } else res.redirect("/");
    }
  });
});

app.listen(3000, () => {
  console.log("server started on port 3000");
});
