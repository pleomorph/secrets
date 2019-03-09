//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect to Mongo database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// Create Schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// Add encryption plugin and secret string from .env
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

// Setup Model
const User = mongoose.model("User", userSchema);


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login", {
    message:""
  });
});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log(err);
    }else{
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else {
      if (foundUser){ // email match
        if (foundUser.password === password){
          res.render("secrets");
        } else { // no password match
          res.render("login",{
            message: "Invalid login"
          });
        }
      } else { // no email match
        res.render("login",{
          message: "Invalid login"
        });
      }
    }
  });
});


///////////////////// Start Server /////////////////////
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
