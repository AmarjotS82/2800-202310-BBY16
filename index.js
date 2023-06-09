
require("./utils.js");

const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

const Swal = require('sweetalert2');

const axios = require('axios');

//Creates a localstorage to sue for te counters 
var LocalStorage = require('node-localstorage').LocalStorage;
//A folder that holds the data
localStorage = new LocalStorage('./scratch');

require('dotenv').config();

const bcrypt = require('bcrypt');

var mongo = require('mongodb');

const Joi = require("joi");

const { Configuration, OpenAIApi } = require("openai");

const app = express();

const readline = require('readline');

// ************For storing environment-specific configuration values************************
const port = process.env.PORT || 3020;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const openai_api_key = process.env.OPENAI_API_KEY;

//------------------------------------------------------------------------------------------


//**************************OpenAI Configuration ***************************************
const configuration = new Configuration({
	apiKey: openai_api_key,
});

const openai = new OpenAIApi(configuration);
//-------------------------------------------------------------------------------------

const questions = [
	"What is the name of your hometown?",
	"What did you want to be growing up?",
	"What is your first car?",
	"What was your first pet's name?",
	"Who is your favourite author?"
];

//*************************Recipe Generation ****************************************

//Saynchronously generates recipe using OpenAI's GPT-3.5 turbo model
const generateRecipe = async (username, dietaryPreference) => {
	const prompt = await constructPrompt(username, dietaryPreference);

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 2048,
		temperature: 1,
	});

	console.log(prompt);
	console.log(response["data"]["choices"][0]["message"]["content"]);
	recipeResponse = response["data"]["choices"][0]["message"]["content"];
	return recipeResponse;
};

//Construct prompts based on user's chosen ingredients and dietary preferences
async function constructPrompt(username, dietaryPreference) {

	// Construct the prompt based on the ingredients and dietary preferences
	let prompt = "Generate a single recipe using ";

	// Add the list of ingredients to the prompt
	const ingredientList = await getLocalIngredients(username);
	console.log("ing: " + ingredientList); //.join(", ");
	prompt += ingredientList;

	// Add dietary preferences to the prompt if provided
	const preferencesList = JSON.parse(dietaryPreference).join(", ");

	if (preferencesList.length > 0) {
		prompt += ", considering these dietary preferences: ";
		prompt += preferencesList;
	}

	// Add miscellaneous information to prompt to format response so that it fits in recipe div
	prompt += ". Put the recipe name in a h2 element."
	prompt += " Put the ingredient and instruction in h3 elements."
	prompt += " Also, provide the fat, protein, calorie and carbohydrates content after the recipe. "
	prompt += " Surround the recipe name, the recipe name and nutritional info in a div element."
	prompt += " Do not give me any HTML head or body tags."
	prompt += " Do not include any images. Do not include any comments in the code."

	return prompt;
}

//-----------------------------------------------------------------------------

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

const savedRecipeCollection = database.db(mongodb_database).collection('saved_recipes');

const testCollection = database.db(mongodb_database).collection('ingredient');

//search recipe collection
const recipeCollection = database.db(mongodb_database).collection('search_recipes');





app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
});
//*********************Establish Session *****************************
app.use(session({
	secret: node_session_secret,
	store: mongoStore,
	saveUninitialized: false,
	resave: true
}
));

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
//------------------------------------------------------------------

app.get('/', (req, res) => { 
	res.render("index");
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/invalid-signup', (req, res) => {
	res.render('invalid-signup');
});

//This checks if the email exist in the database
async function doesEmailExist(email) {
	const result = await userCollection.find({ email: email }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

//This checks if the username exist in the database
async function doesUsernameExist(username) {
	const result = await userCollection.find({ username: username }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

// For user if they forget password, finds the user using email then confirms with a security question.
app.post('/forgetPassword', async (req, res) => {
	var email = req.body.email;

	const schema = Joi.string().email().required();


	const validationResult = schema.validate(email);
	//if validation error then give message
	if (validationResult.error != null) {
		res.render('changePassword', { message: "Invalid Email" });
		return;
	}
	//if email exist
	if (await doesEmailExist(email)) {

		const result = await userCollection.find({ email: email }).project({ email: 1, question: 1 }).toArray();

		var userQuestion = questions[result[0].question];
		//where they answer the question
		//use ejs to get the question they have
		res.render('answer-questions', { question: userQuestion, email: result[0].email });

	} else {
		res.render("changePassword", { message: "Email doesn't exist!" });
		return;

	}


});

// Renders the answer-questions ejs
app.get('/answer-questions', (req, res) => {
	res.render('answer-questions');
});

// This compares the user's answer to the one they have in database.
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

// This overwrites the old password to the new password
app.post('/newpassword/:id', async (req, res) => {
	var password = req.body.password;
	var email = req.params.id;
	//make sure the password input is validated
	const schema = Joi.string().max(20).required();

	//if there is an error with validation then send invalid password
	const validationResult = schema.validate(password);
	if (validationResult.error != null) {
		res.redirect("/changePassword");
		return;
	}

	var hashedPassword = await bcrypt.hash(password, saltRounds);

	await userCollection.updateOne({ email: email }, { $set: { password: hashedPassword } });

	res.render('login');
});

app.post('/setNewDietaryPreference', (req, res) => {
	const preference = req.body.preference;
	const dietaryPreferences = req.body.dietaryPreferences;
	console.log(dietaryPreferences)

	if (dietaryPreferences.includes(preference)) {
		// Remove preference if it's already selected
		const preferenceIndex = dietaryPreferences.indexOf(preference);
		dietaryPreferences.splice(preferenceIndex, 1);
	} else {
		// Add preference if it's not selected
		dietaryPreferences.push(preference);
	}

	res.render('signup', { dietaryPreferences });
});

// This creates a new user and verifies all inputs are valid
// We use joi for validation.
// Incorrect input has a message specific to it
app.post('/submitUser', async (req, res) => { 
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var preferences = req.body.dietaryPreferences;
	console.log("preferences: " + preferences);
	//forget password stuff
	var question = req.body.question;
	var answer = req.body.answer;

	// the joi scheme for the validation
	const schema = Joi.object(
		{
			username: Joi.string().alphanum().max(20).required(),
			email: Joi.string().email().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).required().messages({
				'string.pattern.base': 'Email must be in a valid format.',
    		}),
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

	//if no question is selected then an error is shown with a message
	if (question == 0) {
		var message = "You must select a question.";
		res.render("invalid-signup", { message: message });

		return;
	}

	//if email already exist then an error is shown
	if (await doesEmailExist(email)) {
		var message = "This email already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}

	//if username already exist then error is shown
	if (await doesUsernameExist(username)) {
		var message = "This username already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}

	//hashing password for safety
	var hashedPassword = await bcrypt.hash(password, saltRounds);
	//hashing security answer for safety
	var hashedAnswer = await bcrypt.hash(answer, saltRounds);

	//inserting the user with all the information into the database
	await userCollection.insertOne({ username: username, email: email, password: hashedPassword, answer: hashedAnswer, question: question, dietary_preferences: preferences });
	console.log("inserted user");

	//session is authenticated then redirected to members page
	req.session.authenticated = true;
	req.session.username = req.body.username;
	res.redirect("/loggedin/members/false");

	return;
});

//Our middleware
app.use('/loggedin', sessionValidation);
app.get('/loggedin', (req, res) => {
	//checks if session is authenticated if not then redirect to login
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
	res.render("loggedin");
});

// This verifies user information when they login, gives a specific error when any of the input is incorrect
app.post('/loggingin', async (req, res) => { 
	var Username = req.body.username;
	var Password = req.body.password;

	//the joi scheme for the logging in these values must be valid
	const schema = Joi.object(
		{
			Username: Joi.string().alphanum().max(20).required(),
			Password: Joi.string().max(20).required(),
		});

	//if any error is found from the validation then a message for that particular error is shown
	const validationResult = schema.validate({ Username, Password });
	if (validationResult.error != null) {
		var message = validationResult.error.details[0].message;
		console.log(validationResult.error);
		res.render('invalid-login', { message: message })
		return;
	}

	//finds the user from the database using username
	const result = await userCollection.find({ username: Username }).project({ password: 1, _id: 1, username: 1, email: 1 }).toArray();

	if (result.length != 1) { //if user doesnt exist
		
		res.render('invalid-login', { message: "User does not exist!" })
		return;
	}

	//this compares the hashed password with the hashed input password
	if (await bcrypt.compare(Password, result[0].password)) {
		//sets the authenticated variable to true
		req.session.authenticated = true;
		req.session.email = result[0].email;
		req.session.username = result[0].username;
		req.session.cookie.maxAge = expireTime;
		req.session.dietaryPreferences = [];

		res.redirect('/loggedin/members/false');
		
	}
	else {
		res.render('invalid-login', { message: "Password is incorrect!" })
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

//new stuff added
app.use(express.static(__dirname + "/public"));

// This is the route to members page where id is either true or false if true then an alert for saving recipe is show, false for normal
app.get('/loggedin/members/:id', async (req, res) => {
	var id = req.params.id;

	//assigns recipe  variable to the session variable
	const recipe = req.session.recipe;

	//assign username variable to the session variable
	var username = req.session.username;

	const result = await userCollection.find({ username: username }).project({ username: 1 }).toArray();

	res.render('members', { recipe: recipe, username: result[0].username, isValid: id });
})


app.post('/generateRecipe', async (req, res) => {
	let emptyArray = [];
	const dietaryPreferences = req.body.dietaryPreferences;
	req.session.recipe = await generateRecipe(req.session.username, dietaryPreferences);
	await userCollection.updateOne({ username: req.session.username }, { $set: { selected_ingredients: emptyArray } });

	res.redirect('/loggedin/members/false');

});

// This resets the recipe session
app.post('/clearRecipe', async (req, res) => {
	req.session.recipe = '';
	res.redirect('loggedin/members/false');
});

// Route handler for adding an item to the local storage
app.post('/addToList', (req, res) => {
	const newItem = req.body.item;

	// Retrieve the existing list from local storage
	const existingList = JSON.parse(localStorage.getItem('list')) || [];

	// Add the new item to the list
	existingList.push(newItem);

	// Store the updated list in local storage
	localStorage.setItem('list', JSON.stringify(existingList));

	// Send back the updated list as the response
	res.json(existingList);
});

// Route handler for removing an item from the local storage
app.post('/removeFromList', (req, res) => {
	const itemToRemove = req.body.item;

	// Retrieve the existing list from local storage
	const existingList = JSON.parse(localStorage.getItem('list')) || [];

	// Filter out the item from the list
	const updatedList = existingList.filter((item) => item !== itemToRemove);

	// Store the updated list in local storage
	localStorage.setItem('list', JSON.stringify(updatedList));

	// Send back the updated list as the response
	res.json(updatedList);
});

  //Route for the calorie and carbohydrate counters
app.get('/loggedin/nutrition', async (req, res) => {

	//email to identify the user and get only their information
	var email = req.session.email

	//variable that is gotten from url to check if user is changing calories
	var caloriesPicked = req.query.calories;

	//variable that is gotten from url to check if user is changing carbohydrates
	var carbsPicked = req.query.carbs;


	//Stores the last time the user accessed the page by using email to find the specific user and turns it into an array
	var storedTime = await userCollection.find({email : email}).project({LastDateUsed: 1 }).toArray();
	
	//gets the value in the database at the LastDateUsed field from the array created above
	var lastTime = storedTime[0].LastDateUsed;

	//Gets the current date by creating a new date object and getting the day
	// * Can use var currTime = new Date().getMinutes(); to test this will update every 2 mins
	var currTime = new Date().getDay();
	

	//Checks to see if the value in the array is null which happens the very first time the user accesses the page since they have no previous visits
	if(storedTime[0].LastDateUsed == null){
		//sets the last visit date to current date to be used next visit
		await userCollection.updateOne({ email: email }, { $set: { LastDateUsed: currTime } });

		//Sets all datbase fields to zero since the user hasn't input anything yet
		await userCollection.updateOne({email: email}, {$set: {Calories: 0}});
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: 0}});
		await userCollection.updateOne({email: email}, {$set: {Carbohydrates: 0}});
		await userCollection.updateOne({email: email}, {$set: {carbohydrateGoal: 0}});
	}

	//Check if the user is logging in on a new day and reset values so they can keep track daily
	if(currTime - lastTime >= 1) {
		//sets the last visit date to current date to be used next visit by finding difference between last vist and current date
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});
		//Resets the fields to zero so user can add daily
		await userCollection.updateOne({email: email}, {$set: {Calories: 0}});
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: 0}});
		await userCollection.updateOne({email: email}, {$set: {Carbohydrates: 0}});
		await userCollection.updateOne({email: email}, {$set: {carbohydrateGoal: 0}});
	}else if(currTime < lastTime){
		//This is to deal with days when the differnece of last vist and current date is less than 1
		// Example: May 29 and then June 4 the first if statement wouldn't catch this case and not update values/date 

		//sets the last visit date to current date to be used next visit
		await userCollection.updateOne({ email: email }, { $set: { LastDateUsed: currTime } });

		//Resets the calories and goals to zero so user can add daily
		await userCollection.updateOne({ email: email }, { $set: { Calories: 0 } });
		await userCollection.updateOne({ email: email }, { $set: { CalorieGoal: 0 } });
		await userCollection.updateOne({ email: email }, { $set: { Carbohydrates: 0 } });
		await userCollection.updateOne({ email: email }, { $set: { carbohydrateGoal: 0 } });

	}

	//If CaloriesPicked is true then update calorie related fields and redirect to calorie counter
	if(caloriesPicked){
		//Stores the number of calories the user has input by using email to find the specific user and turns it into an array
		let calorieCount = await userCollection.find({ email: email }).project({ Calories: 1 }).toArray();

		//Stores the calorie goal the user has input by using email to find the specific user and turns it into an array
		let storedcalorieGoal = await userCollection.find({ email: email }).project({ CalorieGoal: 1 }).toArray();

		//renders the Calorie counter page and passes the variables with the values for calorie intake and calorie goal to sue in nutrition.ejs
		res.render("nutrition", {
			Calories: calorieCount[0].Calories,
			calGoal: storedcalorieGoal[0].CalorieGoal,
			cal: caloriesPicked,
			carbs: false
		});
	} else if(carbsPicked){ //If CarbsPicked is true then update carbohydrates related fields and redirect to carbohydrate counter
		let carbCount = await userCollection.find({email : email}).project({Carbohydrates: 1 }).toArray();
		let storedCarbGoal = await userCollection.find({email : email}).project({carbohydrateGoal: 1 }).toArray();
	//renders the Calorie counter page and passes the variables with the values for calorie intake and calorie goal
	res.render("nutrition", {
		Carbohydrates: carbCount[0].Carbohydrates,
		carbGoal: storedCarbGoal[0].carbohydrateGoal,
		cal:false,
		carbs: carbsPicked
	});
	}
	

});
//************ Calorie Counter Page Ends************/

//method to put values in the database
app.post('/nutritionInfo', async (req, res) => {
	//email to idnetify user
	var email = req.session.email;
	//calorie maount value inputted by user
	var calories = req.body.calories;
	//calorie Goal value inputted by user
	var calorieGoal = req.body.calGoal;

	var carbohydrates = req.body.carbohydrates;

	var carbGoal = req.body.carbGoal;

	console.log("carbs amt: " + carbohydrates)
	//If user gives blank input calories is zero so no change to previous value and don't allow negative numbers
	if (calories == "" || calories < 0) {
		calories = 0;
	}

	//Crate schema to validate input is a number and integer
	const schema = Joi.number().integer();

	//Can only fill one feild at a time so other field becomes undefined this makes it so the undefined doesn't get added
	if (calories != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(calories);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition?calories=true");
			return;
		}

		//Find exisiting value so that user can add on to the amount 
		let calCount2 = await userCollection.find({ email: email }).project({ Calories: 1 }).toArray();
		//Add new amount to existing amount
		calCount2[0].Calories += parseInt(calories);
		//Update database with new value
		await userCollection.updateOne({ email: email }, { $set: { Calories: calCount2[0].Calories } });
		res.redirect("/loggedin/nutrition?calories=true");
		return;
	}

	//Can only fill one field at a time so other field becomes undefined this makes it so the undefined doesn't get added
	if (calorieGoal != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(calorieGoal);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition?calories=true");
			return;
		}
		//Set value inputted into the database overwrites old value
		await userCollection.updateOne({ email: email }, { $set: { CalorieGoal: calorieGoal } });
		res.redirect("/loggedin/nutrition?calories=true");
		return;
	}

	if (carbohydrates == "" || carbohydrates < 0) {
		carbohydrates = 0;
	}

	if (carbohydrates != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(carbohydrates);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition?carbs=true");
			return;
		}

		//Find exisiting value so that user can add on to the amount 
		let carbCount = await userCollection.find({ email: email }).project({ Carbohydrates: 1 }).toArray();
		console.log("carbs amt: " + carbohydrates)
		//Add new amount to existing amount
		carbCount[0].Carbohydrates += parseInt(carbohydrates);
		console.log("total: " + carbCount[0].Carbohydrates);
		//Update database with new value
		await userCollection.updateOne({ email: email }, { $set: { Carbohydrates: carbCount[0].Carbohydrates } });
		res.redirect("/loggedin/nutrition?carbs=true");
		return;
	}
	if (carbGoal != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(carbGoal);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition?carbs=true");
			return;
		}
		//Set value inputted into the database overwrites old value
		await userCollection.updateOne({ email: email }, { $set: { carbohydrateGoal: carbGoal } });
		res.redirect("/loggedin/nutrition?carbs=true");
		return;
	}



});

app.get('/filters', async (req, res) => {
	
	res.render("filters", { ingredients: await getLocalIngredients(req.session.username), preferences: req.session.dietaryPreferences });
});

//route for list of ingredients page
app.get("/lists", async (req, res) => {
	//Find all id and names(Food field) of all contents in collection
	
	var ingredientList = await testCollection.find({}).project({ Food: 1 }).toArray();

	let list = [];

	for (let i = 0; i < ingredientList.length; i++) {
		list.push(ingredientList[i].Food);
	}

	const chosenIngredients = await getLocalIngredients(req.session.username);

	chosenIngredients.sort();
	list.sort();
	//Render the lists.ejs file that has the html for this apge
	res.render("lists", { list: list, ingredients: chosenIngredients });
});

//This is the get method for the profile page
app.get("/loggedin/profile", async (req, res) => {
	var username = req.session.username;

	//gets the needed information for the user
	const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, question: 1, dietary_preferences: 1 }).toArray();

	//the preferences
	var preferences = result[0].dietary_preferences;
	console.log(preferences);

	//if preference is null or undefined then preference is null
	if (preferences === null || typeof preferences === 'undefined') {
		preferences = [];
	} else {
		preferences = JSON.parse(preferences);
	}

	//render profile passing the details
	res.render('profile', { username: result[0].username, email: result[0].email, question: questions[result[0].question], dietaryPreferences: preferences });
});


app.get("/loggedin/profilePreferences", async (req, res) => {
	res.render('profilePreferences');
})

async function getLocalIngredients(username) {
	const storedIngredients = await userCollection.find({ username: username }).project({ selected_ingredients: 1 }).toArray();
	return storedIngredients[0].selected_ingredients || [];
}



app.post('/updateLocalIngredient', async (req, res) => {
	const foodName = req.body.foodName;

	let ingredients = await getLocalIngredients(req.session.username);
	console.log(req.session.username);
	const index = ingredients.indexOf(foodName);

	if (index !== -1) {
		// If foodName is already in the ingredients array, remove it
		ingredients.splice(index, 1);
		await userCollection.updateOne({ username: req.session.username }, { $set: { selected_ingredients: ingredients } });
		console.log("Removed " + foodName);
		res.redirect('/lists');
	} else {
		// If foodName is not in the ingredients array, add it
		ingredients.push(foodName);
		await userCollection.updateOne({ username: req.session.username }, { $set: { selected_ingredients: ingredients } });
		console.log("Added " + foodName);
		res.redirect('/lists');
	}
});

app.post('/addUserDietaryPreferences', async (req, res) => {
	const result = await userCollection.find({ username: req.session.username }).project({ dietary_preferences: 1 }).toArray();
	const personalPreferences = result[0].dietary_preferences;
	const storedPreferences = req.session.dietaryPreferences;
	console.log(personalPreferences);
	console.log(storedPreferences);


	if (personalPreferences === storedPreferences) {
		// Clear the dietaryPreferences localStorage
		localStorage.setItem('dietaryPreferences', '[]');
	} else {
		localStorage.setItem('dietaryPreferences', personalPreferences);
	}
	console.log("-------")
	console.log(localStorage.getItem('dietaryPreferences'));
	console.log("--------")
})

//this updates the user dietary profile
app.post('/updateDietaryProfile', async (req, res) => {
	//the selected buttons by user
	var preferencesSelected = req.body.dietaryPreferences;

	//pushing selected into the database
	await userCollection.updateOne({ username: req.session.username }, { $set: { dietary_preferences: preferencesSelected } });
	console.log(preferencesSelected);
	res.redirect('/loggedin/profile');
})

//----------------------- For saving recipes ----------------------

async function saveRecipe(recipe, username) {
	//This finds the recipe name by manipulating string, we made sure the AI output is consistent so we start at index 12 then find the / as it is part of an end tag
	//then we subtract 1 to get the index of <
	recipeName = recipe.substring(12, recipe.indexOf("/") - 1).trim();
	//This just takes the recipe details by taking the data after the index of Ingredients:
	recipeDetails = recipe.substring(recipe.indexOf("Ingredients:"), recipe.length);
	console.log(recipeName);
	console.log(username);

	//Inserts it into the database.
	await savedRecipeCollection.insertOne({ username: username, recipeName: recipeName, recipe: recipeDetails });
	return;
}

//This is the post request for saving recipe using the function above.
app.post('/saveRecipe', async (req, res) => {
	//if type of recipeResponse is not undefined then it saves the recipe
	if (typeof recipeResponse != 'undefined') {
		await saveRecipe(recipeResponse, req.session.username);
		res.redirect("/loggedin/members/true");
		return;
	//if not then redirect user to members
	} else {
		console.log("Must create recipe!");

		res.redirect("/loggedin/members/false");
		return;
	}
})

//------------------------------------------------------------------

//----------------------- For unsaving recipes ----------------------

//This unsaves the recipe by using the recipe id
app.post('/unsaveRecipe/:id', async (req, res) => {
	let recipe_id = req.params.id;

	await savedRecipeCollection.deleteOne({ _id: new mongo.ObjectId(recipe_id) });

	res.redirect("/loggedin/recipes");
})

//------------------------------------------------------------------

//----------------------- For displaying recipes ----------------------

//this displays the recipes in the saved recipe page, it just finds all the recipe that has the username linked into it.
//then passed into recipes
app.get('/loggedin/recipes', async (req, res) => {
	const result = await savedRecipeCollection.find({ username: req.session.username }).toArray();

	res.render('recipes', { result: result })
})


//------------------------------------------------------------------


//----------------------- For recipe modal ----------------------

//this sends a raw data of html that we use on client side to find details for the modal.
app.get('/recipe/:id', async (req, res) => {
	const recipe_id = req.params.id;
	const result = await savedRecipeCollection.find({ _id: new mongo.ObjectId(recipe_id) }).toArray();

	res.send(result);
})


//------------------------------------------------------------------

// *************** searchRecipe section**************************
//route for te search recipe page that renders the ejs
app.get('/loggedin/searchRecipe', async (req, res)=> {
	let recipesList = await recipeCollection.find({}).project({Title: 1,Ingredients: 1,Instructions: 1, Image_Name: 1  }).toArray();	
	res.render('searchRecipe',{ recipe: recipesList});
})

// ------------------------------------------------------

// *************** Grocery List *******************
app.get('/loggedin/todo', (req, res) => {
	res.render('todo');
})
//-------------------------------------------------

// ***************logout section*************************
app.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});
// -----------------------------------------------------

// ***********404 for all page*************************
app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.listen(port, () => {
	console.log("\nListening on port " + port);
});