require("./utils.js");


const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

require('dotenv').config();

const bcrypt = require('bcrypt');

const Joi = require("joi");

const { Configuration, OpenAIApi } = require("openai");

const app = express();

const readline = require('readline');

const port = process.env.PORT || 3020;



const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const openai_api_key = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
	apiKey: openai_api_key,
});

const openai = new OpenAIApi(configuration);

const generateRecipe = async () => {
	const prompt = constructPrompt(ingredients, dietaryPreferences);

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt}],
		max_tokens: 2048,
		temperature: 1,
	});

	console.log(prompt);
	console.log(response["data"]["choices"][0]["message"]["content"]);
};

function constructPrompt(ingredients, dietaryPreferences) {
	// Construct the prompt based on the ingredients and dietary preferences
	let prompt = "Generate a recipe using ";

	// Add the list of ingredients to the prompt
	const ingredientList = ingredients.join(", ");
	prompt += ingredientList;

	// Add dietary preferences to the prompt if provided
	if (dietaryPreferences) {
		prompt += ", considering these dietary preferences: ";
		prompt += dietaryPreferences;
	}

	prompt += " Also, please list each item used in the recipe along with amounts used as a array of JSON objects at the end of the recipe."

	return prompt;
}

// Example usage
const ingredients = ["tofu", "broccoli", "soy sauce", "rice"];
const dietaryPreferences = "vegan";

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');


const testCollection = database.db(mongodb_database).collection('ingredient');

//---------------For generating recipe on console input-----------------


const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Define the method to run when the specific input is received
function processInput() {
	generateRecipe();
}

// Ask for user input
rl.question('Enter 8 into console to generate recipe: ', (answer) => {
	if (answer === '8') {
		processInput();
	} else {
		console.log('Input does not match the specific condition.');
	}

	rl.close();
});

//-------------------------------------------------------------------------


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

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

app.get('/', (req, res) => { //good
	res.render("index");
});

app.get('/signup', (req,res) => {
	res.render('signup');
});

app.get('/invalid-signup', (req,res) => {
	res.render('invalid-signup');
});

async function doesEmailExist(email){
	const result = await userCollection.find({email: email}).project({email: 1, _id: 1, username: 1}).toArray();

	if(result.length == 0) {
		return false;
	} else {
		return true;
	}
}

async function doesUsernameExist(username){
	const result = await userCollection.find({username: username}).project({email: 1, _id: 1, username: 1}).toArray();

	if(result.length == 0) {
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

	if(await doesEmailExist(email)){
		const result = await userCollection.find({email: email}).project({email: 1, question: 1}).toArray();

		var userQuestion = questions[result[0].question];
		//where they answer the question
		//use ejs to get the question they have
		res.render('answer-questions', {question: userQuestion, email: result[0].email});
	} else {
		res.send("INVALID EMAIL");
	}
});

app.get('/answer-questions', (req,res) => {
	res.render('answer-questions');
});

app.post('/submitAnswer/:id', async(req,res) => {
	var answer = req.body.answer;
	var email = req.params.id;

	const result = await userCollection.find({email: email}).project({email: 1, username: 1, answer: 1}).toArray();

	if(await bcrypt.compare(answer, result[0].answer)) {
		//where they will change password
		res.render('correctAnswer', {username: result[0].username, email: email});
		return;
	} else {
		res.render('incorrectAnswer');
		return;
	}
});

app.post('/newpassword/:id', async(req,res) => {
	var password = req.body.password;
	var email = req.params.id;
	const schema = Joi.string().max(20).required();

	const validationResult = schema.validate(password);
	if(validationResult.error != null) {
		res.send("INVALID PASSWORD");
		return;
	}

	var hashedPassword = await bcrypt.hash(password, saltRounds);

	await userCollection.updateOne({email: email}, {$set: {password: hashedPassword}});

	res.render('login');

});

app.post('/submitUser', async(req, res) => { //good
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
	//forget password stuff
	var question = req.body.question;
	var answer = req.body.answer;

    const schema = Joi.object(
		{
			username: Joi.string().alphanum().max(20).required(),
            email: Joi.string().email().required(),
			password: Joi.string().max(20).required(),
			answer: Joi.string().max(20).required(),
		});

	//this confirms everything is valid
	const validationResult = schema.validate({username, email, password, answer});
	if (validationResult.error != null) {
       var message = validationResult.error.details[0].message;
       res.render("invalid-signup", {message: message});
	   return;
   }

   if(question == 0){
	var message = "You must select a question.";
	res.render("invalid-signup", {message: message});

	return;
   }

   if(await doesEmailExist(email)) {
	var message = "This email already exist!";
	res.render("invalid-signup", {message: message});
	return;
   }

   if(await doesUsernameExist(username)) {
	var message = "This username already exist!";
	res.render("invalid-signup", {message: message});
	return;
   }


   var hashedPassword = await bcrypt.hash(password, saltRounds);
   var hashedAnswer = await bcrypt.hash(answer, saltRounds);

   await userCollection.insertOne({username: username, email: email, password: hashedPassword, answer: hashedAnswer, question: question});
   console.log("inserted user");


   req.session.authenticated = true;
   req.session.username = req.body.username;
   res.render("members");

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
		//return;
	}
	else {
        res.render("incorrect-login");
        return;
	}
});

app.use(express.static(__dirname + "/public"));

app.get('/login', (req, res) => {
	res.render('login');
});

//this is where the 
app.get('/changePassword', (req, res) => {
	res.render('changePassword');
});

app.use(express.static(__dirname + "/public"));


//new stuff added

app.get('/login',(req,res) => {
    res.render("login");
    
})

app.get('/members', (req,res) => {
	res.render('members');
});

// app.post('/loggingIn', async (req,res) => {
//     var personal_Id = req.body.personal_Id;
//     var email
//     var password = req.body.pwd;

//     const schema = Joi.object(
//         {
//             password: Joi.string().max(20).required(),
//             email: Joi.string().email().max(20).required()
//         });

//     const validationResult = schema.validate({ password,personal_Id});

// 	if (validationResult.error != null) {
// 	   console.log(validationResult.error);
// 	   res.redirect("/login");
// 	   return;
// 	}

//     const result = await userCollection.find({id: personal_Id}).project({email: 1, password: 1,user_type: 1}).toArray();
    
//     console.log("L: " + result.length);
//     if (result.length != 1) {
// 		console.log("id not found");
// 		res.render("submitLogin");
// 		return;
// 	}
// 	if (await bcrypt.compare(password, result[0].password)) {
// 		console.log("correct password");
//         console.log(result[0].user_type);
// 		req.session.authenticated = true;
// 		req.session.id = result[0].id;
// 		req.session.cookie.maxAge = timeUntilExpires;
//         req.session.user_type = result[0].user_type;
// 		res.redirect('/members');
// 		return;
// 	}
// 	else {
// 		console.log("incorrect password");
// 		res.render("submitLogin");
// 		return;
// 	}
// });

// app.get('/logout',(req,res) => {
//     req.session.authenticated = false;
//     req.session.destroy();
//     res.redirect('/');
    
// });

app.get('/nutrition', async (req,res) => {
	var index = 0;
	
	
	//console.log(list);
	res.render("nutrition");
})

//route for list of ingredients page
app.get("/lists", async  (req,res) => {
	//Find all id and names(Food field) of all contents in collection
	//Make sure capital F for food otherwise doesn't work
	const ingredientList = await testCollection.find({}).project({ _id: 1, "Food": 1 }).toArray();
	//Checking if it works
	for(var i = 0; i < ingredientList.length; i++){
		console.log("L: " + ingredientList[i].Food);
	}
	//Render the lists.ejs file that has the html for this apge
	res.render("lists",{list: ingredientList});
});

app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.listen(port, () => {
	console.log("\nListening on port " + port);

});