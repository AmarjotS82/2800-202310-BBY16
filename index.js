require("./utils.js");

const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

require('dotenv').config();

const bcrypt = require('bcrypt');

const Joi = require("joi");

const app = express();

const port = process.env.PORT || 3020;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
});

app.use(session({ 
    secret: node_session_secret,
	store: mongoStore,
	saveUninitialized: false, 
	resave: true
}
));

/** Use later for valid session */
// function isValidSession(req) {
//     if (req.session.authenticated) {
//         return true;
//     }
//     return false;
// }

app.get('/', (req,res) => { //good
    res.render("index");
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/login', (req, res) => {
	res.render('login');
});

//this is where the 
app.get('/changePassword', (req, res) => {
	res.render('changePassword');
});

// @backend this is where the doc goes after the user hit the submit button in signup page
//doc needs to get saved in db and redirect the user accordingly(either main or give them the error message)
app.post('/submitUser', async (req, res) => {
});

//@backend this is where login documents coming in
app.post('/logingin', async (req, res) => {});

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log("Listening on port " + port);
});