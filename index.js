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

//add this later on signup ejs
app.post('/displayQuestions', async(erq,res) => {
	var questions = [
		"What is the name of your hometown?",
		"What did you want to be growing up?",
		"What is your first car?",
		"What was your first pet's name?",
		"Who is your favourite author?"
	];

	for(var i = 0; i < questions.length; i++){

	}
});

async function isEmailValid(email){
	const result = await userCollection.find({email: email}).project({email: 1, _id: 1, username: 1}).toArray();

	if(result.length != 1) {
		return false;
	} else {
		return true;
	}
}

app.post('/forgetPassword', async(req, res) => {
	var email = req.body.email;

    var questions = [
        "What is the name of your hometown?",
        "What did you want to be growing up?",
        "What is your first car?",
        "What was your first pet's name?",
        "Who is your favourite author?"
    ];

	if(isEmailValid(email)){
		const result = await userCollection.find({email: email}).project({question: 1}).toArray();

		var userQuestion = questions[result[0].question];
		//where they answer the question
		//use ejs to get the question they want
		res.render('/placeHolderForWhereTheyAnswerQuestion', {question: userQuestion});
	}
	
});

app.post('/placeHolderForWhereTHeyAnswerQuestion', async(req,res) => {
	var answer = req.body.answer;

	const result = await userCollection.find({email: email}).project({email: 1, username: 1, answer: 1}).toArray();

	if(await bcrypt.compare(answer, result[0].answer)) {
		//where they will change password
		res.render('/correctAnswer');
		return;
	} else {
		res.render('/incorrectAnswer');
		return;
	}
});

app.post('/submitUser', async(req, res) => { //good
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
	//forget password stuff
	var securityQuestion = req.body.question;
	var securityAnswer = req.body.answer;

    const schema = Joi.object(
		{
			username: Joi.string().alphanum().max(20).required(),
            email: Joi.string().email().required(),
			password: Joi.string().max(20).required()
		});

	const validationResult = schema.validate({username, email, password});
	if (validationResult.error != null) {
       var message = validationResult.error.details[0].message;
       res.render("invalid-signup", {message: message});
	   return;
   }

   var hashedPassword = await bcrypt.hash(password, saltRounds);
   var hashedAnswer = await bcrypt.hash(securityAnswer, saltRounds);

   await userCollection.insertOne({username: username, email: email, password: hashedPassword, answer: hashedAnswer, question: securityQuestion});
   console.log("inserted user");


   req.session.authenticated = true;
   req.session.username = req.body.username;
   res.redirect("/members");

   return;
});

app.post('/loggingin', async (req,res) => { //done
    var username = req.body.username;
    var password = req.body.password;

	const schema = Joi.string().max(20).required();
	const validationResult = schema.validate(username);
	if (validationResult.error != null) {
	   console.log(validationResult.error);
	   res.redirect("/login");
	   return;
	}

	const result = await userCollection.find({username: username}).project({password: 1, _id: 1, username: 1}).toArray();

	if (result.length != 1) { //if user doesnt exist
        res.render("incorrect-login");
		return;
	}

	if (await bcrypt.compare(password, result[0].password)) {
		console.log("correct password");
		req.session.authenticated = true;
		req.session.email = result[0].email;
        req.session.name = result[0].name;
		req.session.cookie.maxAge = expireTime;

		res.redirect('/members');
		return;
	}
	else {
        res.render("incorrect-login");
        return;
	}
});



app.use(express.static(__dirname + "/public"));


app.get("*", (req,res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log("Listening on port " + port);
});