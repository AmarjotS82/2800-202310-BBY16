require("./utils.js");

const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

require('dotenv').config();

const bcrypt = require('bcrypt');

var mongo = require('mongodb');

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

const questions = [
	"What is the name of your hometown?",
	"What did you want to be growing up?",
	"What is your first car?",
	"What was your first pet's name?",
	"Who is your favourite author?"
];

const generateRecipe = async () => {
	const prompt = constructPrompt(ingredients);

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 2048,
		temperature: 1,
	});

	console.log(prompt);
	// console.log(response["data"]["choices"][0]["message"]["content"]);
	recipe = response["data"]["choices"][0]["message"]["content"];
	return recipe;
};

function constructPrompt(ingredients) {
	// Construct the prompt based on the ingredients and dietary preferences
	let prompt = "Generate a recipe using ";

	// Add the list of ingredients to the prompt
	const ingredientList = ingredients.join(", ");
	prompt += ingredientList;

	// Add dietary preferences to the prompt if provided
	//if (dietaryPreferences) {
	//	prompt += ", considering these dietary preferences: ";
	//	prompt += dietaryPreferences;
	//}

	//prompt += " Also, please list each item used in the recipe along with amounts used as a array of JSON objects at the end of the recipe."

	return prompt;
}

// Example usage
const ingredients = [];
//const dietaryPreferences = "vegan";

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

const savedRecipeCollection = database.db(mongodb_database).collection('saved_recipes');

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

//Crates a localstroage to sue for te counters 
var LocalStorage = require('node-localstorage').LocalStorage;
//A folder that holds the data
localStorage = new LocalStorage('./scratch');

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
function isValidSession(req) {
	if (req.session.authenticated) {
		return true;
	}
	return false;
}

function sessionValidation(req, res, next) {
	if (isValidSession(req)) {
		next();
	}
	else {
		res.redirect('/login');
	}
}

app.get('/', (req, res) => { //good
	res.render("index");
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/invalid-signup', (req, res) => {
	res.render('invalid-signup');
});

async function doesEmailExist(email) {
	const result = await userCollection.find({ email: email }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

async function doesUsernameExist(username) {
	const result = await userCollection.find({ username: username }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

app.post('/forgetPassword', async (req, res) => {
	var email = req.body.email;

	const schema = Joi.string().email().required();

	const validationResult = schema.validate(email);
	if (validationResult.error != null) {
		res.render('changePassword', { message: "Invalid Email" });
		return;
	}

	if (await doesEmailExist(email)) {

		const result = await userCollection.find({ email: email }).project({ email: 1, question: 1 }).toArray();

		var userQuestion = questions[result[0].question];
		//where they answer the question
		//use ejs to get the question they have
		res.render('answer-questions', { question: userQuestion, email: result[0].email });

	} else {
		res.render("changePassword", {message: "Email doesn't exist!"});
		return;

	}


});

app.get('/answer-questions', (req, res) => {
	res.render('answer-questions');
});

app.post('/submitAnswer/:id', async (req, res) => {
	var answer = req.body.answer;
	var email = req.params.id;

	const result = await userCollection.find({ email: email }).project({ email: 1, username: 1, answer: 1 }).toArray();

	if (await bcrypt.compare(answer, result[0].answer)) {
		//where they will change password
		res.render('correctAnswer', { username: result[0].username, email: email });
		return;
	} else {
		res.render('incorrectAnswer');
		return;
	}
});

app.post('/newpassword/:id', async (req, res) => {
	var password = req.body.password;
	var email = req.params.id;
	const schema = Joi.string().max(20).required();

	const validationResult = schema.validate(password);
	if (validationResult.error != null) {
		res.send("INVALID PASSWORD");
		return;
	}

	var hashedPassword = await bcrypt.hash(password, saltRounds);

	await userCollection.updateOne({ email: email }, { $set: { password: hashedPassword } });

	res.render('login');
});

app.post('/submitUser', async (req, res) => { //good
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
	const validationResult = schema.validate({ username, email, password, answer });
	if (validationResult.error != null) {
		var message = validationResult.error.details[0].message;
		res.render("invalid-signup", { message: message });
		return;
	}

	if (question == 0) {
		var message = "You must select a question.";
		res.render("invalid-signup", { message: message });

		return;
	}

	if (await doesEmailExist(email)) {
		var message = "This email already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}

	if (await doesUsernameExist(username)) {
		var message = "This username already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}


	var hashedPassword = await bcrypt.hash(password, saltRounds);
	var hashedAnswer = await bcrypt.hash(answer, saltRounds);

	await userCollection.insertOne({ username: username, email: email, password: hashedPassword, answer: hashedAnswer, question: question });
	console.log("inserted user");


	req.session.authenticated = true;
	req.session.username = req.body.username;
	res.redirect("/loggedin/members");

	return;
});

app.use('/loggedin', sessionValidation);
app.get('/loggedin', (req, res) => {
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
	res.render("loggedin");
});

app.post('/loggingin', async (req, res) => { //done
	var username = req.body.username;
	var password = req.body.password;

	const schema = Joi.string().max(20).required();
	const validationResult = schema.validate(username, password);
	if (validationResult.error != null) {
		console.log(validationResult.error);
		res.redirect("/login");
		return;
	}

	const result = await userCollection.find({ username: username }).project({ password: 1, _id: 1, username: 1, email: 1 }).toArray();

	if (result.length != 1) { //if user doesnt exist
		res.redirect("/login");
		return;
	}

	if (await bcrypt.compare(password, result[0].password)) {
		console.log("correct password");
		req.session.authenticated = true;
		req.session.email = result[0].email;
		console.log(req.session.email);
		req.session.username = result[0].username;
		console.log(req.session.username);
		req.session.cookie.maxAge = expireTime;

		res.redirect('/loggedin/members');
		//return;
	}
	else {
		res.redirect("/login");
		return;
	}
});


app.use(express.static(__dirname + "/public"));

app.get('/login', (req, res) => {
	res.render('login');
});

//this is where the 
app.get('/changePassword', (req, res) => {
	res.render('changePassword', { message: "" });
});

app.use(express.static(__dirname + "/public"));

//new stuff added

app.get('/login', (req, res) => {
	res.render("login");

})


app.get('/loggedin/members', (req,res) => {
	recipe = req.body.recipe;
	res.render('members', {recipe: recipe});
})

app.post('/generateRecipe', async (req,res) =>{
	recipe = await generateRecipe();
	res.render('members', {recipe: recipe});
})



app.get('/loggedin/nutrition', async (req, res) => {

	//Store in session and have it resest daily 
	//so it persists and doesnt get resset every time you load a page
	var email = req.session.email

	
	var storedTime = await userCollection.find({email : email}).project({LastDateUsed: 1 }).toArray();
	console.log("Stored:" + storedTime[0].LastDateUsed);
	var lastTime = storedTime[0].LastDateUsed;
	var currTime = new Date().getMinutes();

	console.log(lastTime);

	if(storedTime[0].LastDateUsed == null){
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});
	}
	
	if(currTime - lastTime > 1) {
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});
		localStorage.setItem("Calories",0);
		localStorage.setItem("Caffeine",0);
		localStorage.setItem("calGoal",0)
		localStorage.setItem("cafGoal",0)
	}else if(currTime < lastTime){
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});
		localStorage.setItem("Calories",0);
		localStorage.setItem("Caffeine",0);
		localStorage.setItem("calGoal",0)
		localStorage.setItem("cafGoal",0)

	}



	//console.log("c2: " + calories);
	console.log("cf2: " + localStorage.getItem("Caffeine"));
	res.render("nutrition", {
		Calories: localStorage.getItem("Calories"),
		Caffeine: localStorage.getItem("Caffeine"),
		calGoal: localStorage.getItem("calGoal"), cafGoal: localStorage.getItem("cafGoal"),
	});
});

app.post('/nutritionInfo', (req,res) => {

	var calories = req.body.calories;
	var caffeine = req.body.caffeine;
	var calorieGoal = req.body.calGoal;
	var caffeineGoal = req.body.cafGoal;
	console.log("cf " + caffeineGoal);
	console.log("cl " + calorieGoal);
	var calCount = 0;

	if (calories == "") {
		calories = 0;
	} else if (caffeine == "") {
		caffeine = 0;
	}

	const schema = Joi.number().integer();


	if (calories != null) {
		const validationResult = schema.validate(calorieGoal);
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition");
			return;
		}
		calCount += parseInt(calories);
		if (localStorage.getItem("Calories") != null) {
			calCount += parseInt(localStorage.getItem("Calories"));
		}
	} else {
		calCount += parseInt(localStorage.getItem("Calories"));
	}
	// Store
	localStorage.setItem("Calories", calCount);

	if (calorieGoal != null) {
		const validationResult = schema.validate(calorieGoal);
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition");
			return;
		}
		localStorage.setItem("calGoal", calorieGoal);
	}

	let cafCount = 0;


	if (caffeine != null) {
		cafCount += parseInt(caffeine);
		if (localStorage.getItem("Calories") != null) {
			cafCount += parseInt(localStorage.getItem("Caffeine"));
		}
	} else {
		cafCount += parseInt(localStorage.getItem("Caffeine"));
	}

	// Store
	localStorage.setItem("Caffeine", cafCount);

	if (caffeineGoal != null) {
		const validationResult = schema.validate(caffeineGoal);
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition");
			return;
		}

		localStorage.setItem("cafGoal", caffeineGoal);
	}

	// Store


	res.redirect("/loggedin/nutrition");


});

app.get('/filters',(req, res)  => {
	res.render("filters", { ingredients });
});

//route for list of ingredients page
app.get("/lists", async (req, res) => {
	//Find all id and names(Food field) of all contents in collection
	//Make sure capital F for food otherwise doesn't work
	const ingredientList = await testCollection.find({}).project({ _id: 1, "Food": 1 }).toArray();
	//Checking if it works
	for (var i = 0; i < ingredientList.length; i++) {
		// console.log("L: " + ingredientList[i].Food);
	}
	//Render the lists.ejs file that has the html for this apge
	res.render("lists", { list: ingredientList });
});

app.get("/loggedin/members/profile", async (req, res) => {
	var username = req.session.username;

	const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, question: 1 }).toArray();

	res.render('profile', { username: result[0].username, email: result[0].email, question: questions[result[0].question] });
});

app.post('/updateLocalIngredient/', (req, res) => {
	const foodName = req.body.foodName;
	const index = ingredients.indexOf(foodName);

	if (index !== -1) {
		// If foodName is already in the ingredients array, remove it
		ingredients.splice(index, 1);
		console.log("Removed " + foodName);
	} else {
		// If foodName is not in the ingredients array, add it
		ingredients.push(foodName);
		console.log("Added " + foodName);
	}

	console.log(ingredients);
});


//----------------------- For saving recipes ----------------------

async function saveRecipe( recipe, username) {
	recipeName = recipe.substring(0, recipe.indexOf("Ingredients:")).trim();
	recipeDetails = recipe.substring(recipe.indexOf("Ingredients:"), recipe.length);
	console.log(recipeName);
	console.log(username);

	await savedRecipeCollection.insertOne({username: username, recipeName: recipeName, recipe: recipeDetails});
}

app.post('/saveRecipe', async (req,res) => {
	if(typeof recipe !== 'undefined') {
		saveRecipe(recipe, req.session.username);
		res.redirect('/loggedin/recipes');
	} else {
		console.log("Must create recipe!");
		return;
	}
})

//------------------------------------------------------------------

//----------------------- For unsaving recipes ----------------------

app.post('/unsaveRecipe/:id', async (req,res) => {
	let recipe_id = req.params.id;

	await savedRecipeCollection.deleteOne({_id: new mongo.ObjectId(recipe_id)});
	// const result = await savedRecipeCollection.find({_id: new mongo.ObjectId(recipe_id)}).toArray();



	// console.log(result[0].recipeName)

	res.redirect("/loggedin/recipes");
})

//------------------------------------------------------------------

//----------------------- For displaying recipes ----------------------

app.get('/loggedin/recipes', async (req, res) => {
	const result = await savedRecipeCollection.find({username: req.session.username }).toArray();

	res.render('recipes', {result: result})
})


//------------------------------------------------------------------


//----------------------- For recipe modal ----------------------

app.get('/recipe/:id', async (req,res ) => {
	const recipe_id = req.params.id;
	const result = await savedRecipeCollection.find({_id: new mongo.ObjectId(recipe_id)}).toArray();

	res.send(result);
})


//------------------------------------------------------------------

// ***************logout section**************************
app.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});
// ------------------------------------------------------

// ***********404 for all page****************
app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.listen(port, () => {
	console.log("\nListening on port " + port);
});